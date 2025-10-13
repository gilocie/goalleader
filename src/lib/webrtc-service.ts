
import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  Firestore,
  Unsubscribe,
  getDoc 
} from 'firebase/firestore';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private firestore: Firestore;
  private callId: string;
  private userId: string;
  private isInitiator: boolean;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  
  private iceCandidateUnsubscribe: Unsubscribe | null = null;
  private callDocUnsubscribe: Unsubscribe | null = null;
  
  // Track what we've already processed to prevent duplicates
  private hasProcessedOffer = false;
  private hasProcessedAnswer = false;
  private isSettingRemoteDescription = false;

  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  constructor(
    firestore: Firestore, 
    callId: string, 
    userId: string, 
    isInitiator: boolean
  ) {
    this.firestore = firestore;
    this.callId = callId;
    this.userId = userId;
    this.isInitiator = isInitiator;

    // Enable verbose logging in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).webrtcDebug = {
        service: this,
        getPeerConnection: () => this.peerConnection,
        getSignalingState: () => this.peerConnection?.signalingState,
        getConnectionState: () => this.peerConnection?.connectionState,
        getIceConnectionState: () => this.peerConnection?.iceConnectionState,
      };
    }
  }

  async initialize(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    mediaConstraints: MediaStreamConstraints = { audio: true, video: false }
  ): Promise<MediaStream> {
    try {
      console.log(`[WebRTC] Initializing - Role: ${this.isInitiator ? 'Initiator' : 'Receiver'}`);
      
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log('[WebRTC] Got local stream');

      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTC] Received remote track:', event.track.kind);
        this.remoteStream = event.streams[0];
        onRemoteStream(this.remoteStream);
      };

      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          onConnectionStateChange(this.peerConnection.connectionState);
        }
      };
      
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(event.candidate);
        }
      };
      
      await this.setupListeners();
      
      if (this.isInitiator) {
        await this.createOffer();
      }

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Initialization failed:', error);
      this.cleanup();
      throw error;
    }
  }

  private async setupListeners(): Promise<void> {
    this.listenForIceCandidates();
    await this.listenForSignaling();
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTC] Cannot create offer: peer connection not initialized');
      return;
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });
    } catch (error) {
      console.error('[WebRTC] Failed to create offer:', error);
    }
  }

  private async createAnswer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || this.hasProcessedOffer) return;
    this.hasProcessedOffer = true;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      });
      await this.processIceCandidateQueue();
    } catch (error) {
      console.error('[WebRTC] Failed to create answer:', error);
      this.hasProcessedOffer = false;
    }
  }

  private async listenForSignaling(): Promise<void> {
    const callRef = doc(this.firestore, 'calls', this.callId);
    
    this.callDocUnsubscribe = onSnapshot(callRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data || !this.peerConnection) return;

      if (!this.isInitiator && data.offer && !this.hasProcessedOffer) {
        await this.createAnswer(data.offer);
      }
      
      if (this.isInitiator && data.answer && !this.hasProcessedAnswer) {
        await this.handleAnswer(data.answer);
      }
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || this.hasProcessedAnswer) return;
    this.hasProcessedAnswer = true;
    
    try {
        if (this.peerConnection.signalingState === 'have-local-offer') {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            await this.processIceCandidateQueue();
        } else {
             console.warn('[WebRTC] Cannot set answer, wrong signaling state:', this.peerConnection.signalingState);
             this.hasProcessedAnswer = false;
        }
    } catch (error) {
        console.error('[WebRTC] Failed to handle answer:', error);
        this.hasProcessedAnswer = false;
    }
  }
  
  private async processIceCandidateQueue(): Promise<void> {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      if (candidate && this.peerConnection) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('[WebRTC] Error adding queued ICE candidate:', error);
        }
      }
    }
  }

  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      const candidatesRef = collection(this.firestore, 'calls', this.callId, 'iceCandidates');
      await addDoc(candidatesRef, {
        candidate: candidate.toJSON(),
        fromUser: this.userId,
      });
    } catch (error) {
      console.error('[WebRTC] Failed to send ICE candidate:', error);
    }
  }

  private listenForIceCandidates(): void {
    const candidatesRef = collection(this.firestore, 'calls', this.callId, 'iceCandidates');

    this.iceCandidateUnsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          if (data.fromUser !== this.userId && this.peerConnection) {
            const candidate = new RTCIceCandidate(data.candidate);
            
            if (this.peerConnection.remoteDescription) {
              try {
                await this.peerConnection.addIceCandidate(candidate);
              } catch (error) {
                console.error('[WebRTC] Error adding ICE candidate:', error);
              }
            } else {
              this.iceCandidateQueue.push(candidate);
            }
          }
        }
      });
    });
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  cleanup(): void {
    console.log('[WebRTC] Cleaning up...');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.iceCandidateUnsubscribe) {
      this.iceCandidateUnsubscribe();
      this.iceCandidateUnsubscribe = null;
    }

    if (this.callDocUnsubscribe) {
      this.callDocUnsubscribe();
      this.callDocUnsubscribe = null;
    }

    this.remoteStream = null;
    this.hasProcessedOffer = false;
    this.hasProcessedAnswer = false;
    this.isSettingRemoteDescription = false;
    this.iceCandidateQueue = [];
  }
}
