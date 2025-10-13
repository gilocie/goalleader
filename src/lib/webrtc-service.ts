

import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  Firestore,
  Unsubscribe 
} from 'firebase/firestore';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private firestore: Firestore;
  private callId: string;
  private userId: string;
  private isInitiator: boolean;
  
  private iceCandidateUnsubscribe: Unsubscribe | null = null;
  private callDocUnsubscribe: Unsubscribe | null = null;

  // Configuration for ICE servers
  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // For production, add TURN servers:
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
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
  }

  /**
   * Initialize the peer connection
   */
  async initialize(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    mediaConstraints: MediaStreamConstraints = { audio: true, video: false }
  ): Promise<MediaStream> {
    try {
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Setup remote stream
      this.remoteStream = new MediaStream();
      
      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream?.addTrack(track);
        });
        onRemoteStream(this.remoteStream!);
      };

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        if (this.peerConnection) {
          onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(event.candidate);
        }
      };

      // Listen for remote ICE candidates
      this.listenForIceCandidates();

      // Listen for call document changes (offer/answer)
      this.listenForSignaling();

      // If initiator, create the offer now that connection is initialized
      if (this.isInitiator) {
          await this.createOffer();
      }

      return this.localStream;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  /**
   * Create and send an offer (caller side)
   */
  async createOffer(): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Store offer in Firestore
      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });

      console.log('Offer created and sent');
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }

  /**
   * Create and send an answer (receiver side)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Store answer in Firestore
      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      });

      console.log('Answer created and sent');
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw error;
    }
  }

  /**
   * Listen for signaling data (offer/answer)
   */
  private listenForSignaling(): void {
    const callRef = doc(this.firestore, 'calls', this.callId);
    
    this.callDocUnsubscribe = onSnapshot(callRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data || !this.peerConnection) return;

      // If we're the caller and we receive an answer
      if (this.isInitiator && data.answer && !this.peerConnection.currentRemoteDescription) {
        try {
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('Answer received and set');
        } catch (error) {
          console.error('Failed to set remote description:', error);
        }
      }

      // If we're the receiver and we receive an offer
      if (!this.isInitiator && data.offer && !this.peerConnection.currentRemoteDescription) {
        try {
          await this.createAnswer(data.offer);
        } catch (error) {
          console.error('Failed to create answer:', error);
        }
      }
    });
  }

  /**
   * Send ICE candidate to Firestore
   */
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
    } catch (error) {
      console.error('Failed to send ICE candidate:', error);
    }
  }

  /**
   * Listen for remote ICE candidates
   */
  private listenForIceCandidates(): void {
    const candidatesRef = collection(
      this.firestore, 
      'calls', 
      this.callId, 
      'iceCandidates'
    );

    this.iceCandidateUnsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Only process candidates from the other user
          if (data.fromUser !== this.userId && this.peerConnection) {
            const candidate = new RTCIceCandidate(data.candidate);
            this.peerConnection.addIceCandidate(candidate).catch((error) => {
              console.error('Failed to add ICE candidate:', error);
            });
          }
        }
      });
    });
  }

  /**
   * Toggle local audio track
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle local video track
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get current local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get current remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
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
  }
}
