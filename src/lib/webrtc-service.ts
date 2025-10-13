
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
      
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log('[WebRTC] Got local stream');

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Setup remote stream
      this.remoteStream = new MediaStream();
      
      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          console.log(`[WebRTC] Adding local track: ${track.kind}`);
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTC] Received remote track:', event.track.kind);
        event.streams[0].getTracks().forEach((track) => {
          if (this.remoteStream && !this.remoteStream.getTracks().includes(track)) {
            this.remoteStream.addTrack(track);
          }
        });
        onRemoteStream(this.remoteStream!);
      };

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          console.log('[WebRTC] Connection state:', this.peerConnection.connectionState);
          onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Monitor ICE connection state
      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection) {
          console.log('[WebRTC] ICE connection state:', this.peerConnection.iceConnectionState);
        }
      };

      // Monitor signaling state
      this.peerConnection.onsignalingstatechange = () => {
        if (this.peerConnection) {
          console.log('[WebRTC] Signaling state:', this.peerConnection.signalingState);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] New ICE candidate');
          this.sendIceCandidate(event.candidate);
        } else {
          console.log('[WebRTC] ICE gathering complete');
        }
      };

      // Set up listeners BEFORE creating offer
      await this.setupListeners();

      // If initiator, create offer after listeners are ready
      if (this.isInitiator) {
        // Small delay to ensure Firestore listeners are active
        await new Promise(resolve => setTimeout(resolve, 100));
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
    // Listen for remote ICE candidates
    this.listenForIceCandidates();
    
    // Listen for signaling (offer/answer)
    await this.listenForSignaling();
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTC] Cannot create offer: peer connection not initialized');
      return;
    }

    try {
      console.log('[WebRTC] Creating offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.localStream?.getVideoTracks().length > 0,
      });
      
      await this.peerConnection.setLocalDescription(offer);
      console.log('[WebRTC] Local description set (offer)');

      // Store offer in Firestore
      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });
      
      console.log('[WebRTC] Offer sent to Firestore');
    } catch (error) {
      console.error('[WebRTC] Failed to create offer:', error);
      throw error;
    }
  }

  private async createAnswer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTC] Cannot create answer: peer connection not initialized');
      return;
    }

    // Prevent processing the same offer multiple times
    if (this.hasProcessedOffer) {
      console.log('[WebRTC] Offer already processed, skipping');
      return;
    }

    try {
      console.log('[WebRTC] Creating answer...');
      this.hasProcessedOffer = true;
      this.isSettingRemoteDescription = true;
      
      // Check current state before setting remote description
      if (this.peerConnection.signalingState !== 'stable') {
        console.log('[WebRTC] Warning: Signaling state is not stable:', this.peerConnection.signalingState);
        // Wait for stable state
        await this.waitForStableState();
      }
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[WebRTC] Remote description set (offer)');
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('[WebRTC] Local description set (answer)');

      // Store answer in Firestore
      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      });
      
      console.log('[WebRTC] Answer sent to Firestore');
      
      // Process any queued ICE candidates
      await this.processIceCandidateQueue();
      
    } catch (error) {
      console.error('[WebRTC] Failed to create answer:', error);
      this.hasProcessedOffer = false;
      throw error;
    } finally {
      this.isSettingRemoteDescription = false;
    }
  }

  private async waitForStableState(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection || this.peerConnection.signalingState === 'stable') {
        resolve();
        return;
      }
      
      const checkState = () => {
        if (!this.peerConnection || this.peerConnection.signalingState === 'stable') {
          resolve();
        } else {
          setTimeout(checkState, 100);
        }
      };
      
      checkState();
    });
  }

  private async listenForSignaling(): Promise<void> {
    const callRef = doc(this.firestore, 'calls', this.callId);
    
    // Get initial state first
    const initialSnapshot = await getDoc(callRef);
    const initialData = initialSnapshot.data();
    
    // Process initial data if needed
    if (initialData) {
      if (!this.isInitiator && initialData.offer && !this.hasProcessedOffer) {
        await this.createAnswer(initialData.offer);
      }
    }
    
    // Then set up listener for changes
    this.callDocUnsubscribe = onSnapshot(callRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data || !this.peerConnection) return;

      // Receiver processes offer
      if (!this.isInitiator && data.offer && !this.hasProcessedOffer) {
        await this.createAnswer(data.offer);
      }
      
      // Initiator processes answer
      if (this.isInitiator && data.answer && !this.hasProcessedAnswer) {
        await this.handleAnswer(data.answer);
      }
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || this.hasProcessedAnswer) {
      return;
    }

    try {
      console.log('[WebRTC] Processing answer...');
      this.hasProcessedAnswer = true;
      this.isSettingRemoteDescription = true;
      
      // Only set answer if we're in the right state
      if (this.peerConnection.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] Remote description set (answer)');
        
        // Process any queued ICE candidates
        await this.processIceCandidateQueue();
      } else {
        console.warn('[WebRTC] Cannot set answer, wrong signaling state:', this.peerConnection.signalingState);
        this.hasProcessedAnswer = false; // Reset to retry later
      }
    } catch (error) {
      console.error('[WebRTC] Failed to handle answer:', error);
      this.hasProcessedAnswer = false;
    } finally {
      this.isSettingRemoteDescription = false;
    }
  }
  
  private async processIceCandidateQueue(): Promise<void> {
    console.log(`[WebRTC] Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
    
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      if (candidate && this.peerConnection) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
          console.log('[WebRTC] Added queued ICE candidate');
        } catch (error) {
          console.error('[WebRTC] Error adding queued ICE candidate:', error);
        }
      }
    }
  }

  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      const candidatesRef = collection(
        this.firestore, 
        'calls', 
        this.callId, 
        'iceCandidates'
      );
      
      await addDoc(candidatesRef, {
        candidate: candidate.toJSON(),
        fromUser: this.userId,
        timestamp: new Date(),
      });
      
      console.log('[WebRTC] ICE candidate sent');
    } catch (error) {
      console.error('[WebRTC] Failed to send ICE candidate:', error);
    }
  }

  private listenForIceCandidates(): void {
    const candidatesRef = collection(
      this.firestore, 
      'calls', 
      this.callId, 
      'iceCandidates'
    );

    this.iceCandidateUnsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Only process candidates from the other user
          if (data.fromUser !== this.userId && this.peerConnection) {
            const candidate = new RTCIceCandidate(data.candidate);
            
            // Check if we can add the candidate immediately
            if (this.peerConnection.remoteDescription && !this.isSettingRemoteDescription) {
              try {
                await this.peerConnection.addIceCandidate(candidate);
                console.log('[WebRTC] Added ICE candidate');
              } catch (error) {
                console.error('[WebRTC] Error adding ICE candidate:', error);
                // If it fails, queue it
                this.iceCandidateQueue.push(candidate);
              }
            } else {
              // Queue the candidate for later
              console.log('[WebRTC] Queueing ICE candidate (no remote description yet)');
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
    
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`[WebRTC] Stopped local ${track.kind} track`);
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('[WebRTC] Peer connection closed');
    }

    // Unsubscribe from listeners
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
