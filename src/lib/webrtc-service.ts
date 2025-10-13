import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  Firestore,
  Unsubscribe,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs
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
  
  // Track initialization state
  private isInitializing = false;
  private isInitialized = false;
  private isCleanedUp = false;
  
  // Track sent ICE candidates to prevent duplicates
  private sentIceCandidates = new Set<string>();

  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
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

    console.log(`[WebRTC] Constructor called - CallId: ${callId}, Role: ${isInitiator ? 'Initiator' : 'Receiver'}`);

    // Enable verbose logging in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).webrtcDebug = {
        service: this,
        getPeerConnection: () => this.peerConnection,
        getSignalingState: () => this.peerConnection?.signalingState,
        getConnectionState: () => this.peerConnection?.connectionState,
        getIceConnectionState: () => this.peerConnection?.iceConnectionState,
        getIceCandidateQueue: () => this.iceCandidateQueue,
        getRemoteStream: () => this.remoteStream,
        getLocalStream: () => this.localStream,
        isInitialized: () => this.isInitialized,
        isCleanedUp: () => this.isCleanedUp
      };
    }
  }

  async initialize(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    mediaConstraints: MediaStreamConstraints = { audio: true, video: false }
  ): Promise<MediaStream | null> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.warn('[WebRTC] Already initializing, skipping duplicate call');
      return this.localStream;
    }
    
    if (this.isInitialized) {
      console.warn('[WebRTC] Already initialized, skipping duplicate call');
      return this.localStream;
    }
    
    if (this.isCleanedUp) {
      console.error('[WebRTC] Cannot initialize: service has been cleaned up');
      return null;
    }

    this.isInitializing = true;
    console.log(`[WebRTC] Initializing - Role: ${this.isInitiator ? 'Initiator' : 'Receiver'}`);

    try {
      // Step 1: Get user media
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        console.log('[WebRTC] Got local stream with tracks:', {
          audio: this.localStream.getAudioTracks().length,
          video: this.localStream.getVideoTracks().length
        });
      } catch (mediaError: any) {
        console.error('[WebRTC] Media access error:', mediaError.name, mediaError.message);
        throw new Error(`Failed to access media devices: ${mediaError.message}`);
      }

      // Step 2: Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      console.log('[WebRTC] PeerConnection created');
      
      // Step 3: Initialize remote stream
      this.remoteStream = new MediaStream();
      
      // Step 4: Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          console.log(`[WebRTC] Adding local ${track.kind} track`);
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Step 5: Set up event handlers
      this.setupPeerConnectionHandlers(onRemoteStream, onConnectionStateChange);
      
      // Step 6: Set up Firestore listeners
      await this.setupListeners();
      
      // Mark as initialized before creating offer
      this.isInitialized = true;
      this.isInitializing = false;
      
      // Step 7: Create offer if initiator (AFTER everything is set up)
      if (this.isInitiator) {
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (this.peerConnection && !this.isCleanedUp) {
          await this.createOffer();
        } else {
          console.error('[WebRTC] Cannot create offer: peer connection was cleaned up during initialization');
        }
      }

      return this.localStream;
    } catch (error) {
      console.error('[WebRTC] Initialization failed:', error);
      this.isInitializing = false;
      this.isInitialized = false;
      // Clean up on failure
      this.cleanup();
      throw error;
    }
  }

  private setupPeerConnectionHandlers(
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): void {
    if (!this.peerConnection) return;

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind, 'Stream ID:', event.streams[0]?.id);
      event.streams[0]?.getTracks().forEach((track) => {
        if (this.remoteStream && !this.remoteStream.getTracks().includes(track)) {
          this.remoteStream.addTrack(track);
          console.log(`[WebRTC] Added ${track.kind} track to remote stream`);
        }
      });
      if (this.remoteStream && this.remoteStream.getTracks().length > 0) {
        onRemoteStream(this.remoteStream);
      }
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('[WebRTC] Connection state:', this.peerConnection.connectionState);
        onConnectionStateChange(this.peerConnection.connectionState);
        
        // Auto cleanup on terminal states
        if (this.peerConnection.connectionState === 'failed' || 
            this.peerConnection.connectionState === 'closed') {
          console.log('[WebRTC] Connection in terminal state, cleaning up');
        }
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log('[WebRTC] ICE connection state:', this.peerConnection.iceConnectionState);
        if (this.peerConnection.iceConnectionState === 'failed') {
          console.error('[WebRTC] ICE connection failed - attempting restart');
          this.peerConnection.restartIce();
        }
      }
    };

    this.peerConnection.onsignalingstatechange = () => {
      if (this.peerConnection) {
        console.log('[WebRTC] Signaling state:', this.peerConnection.signalingState);
      }
    };

    this.peerConnection.onicegatheringstatechange = () => {
      if (this.peerConnection) {
        console.log('[WebRTC] ICE gathering state:', this.peerConnection.iceGatheringState);
      }
    };
    
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate:', event.candidate.protocol, event.candidate.type);
        this.sendIceCandidate(event.candidate);
      } else {
        console.log('[WebRTC] ICE gathering complete');
      }
    };
  }

  private async setupListeners(): Promise<void> {
    this.listenForIceCandidates();
    await this.listenForSignaling();
  }

  private async createOffer(): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTC] Cannot create offer: peer connection not initialized');
      throw new Error('Peer connection not initialized');
    }
    
    if (this.isCleanedUp) {
      console.error('[WebRTC] Cannot create offer: service has been cleaned up');
      return;
    }

    try {
      console.log('[WebRTC] Creating offer...');
      
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.localStream?.getVideoTracks().length ? true : false,
      };
      
      const offer = await this.peerConnection.createOffer(offerOptions);
      
      console.log('[WebRTC] Setting local description (offer)');
      await this.peerConnection.setLocalDescription(offer);

      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        offerCreatedAt: serverTimestamp()
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
    
    if (this.hasProcessedOffer) {
      console.log('[WebRTC] Offer already processed, skipping');
      return;
    }
    
    if (this.isCleanedUp) {
      console.error('[WebRTC] Cannot create answer: service has been cleaned up');
      return;
    }
    
    try {
      console.log('[WebRTC] Creating answer...');
      this.hasProcessedOffer = true;
      this.isSettingRemoteDescription = true;
      
      const currentState = this.peerConnection.signalingState;
      if (currentState !== 'stable') {
        console.warn('[WebRTC] Signaling state not stable:', currentState);
        this.hasProcessedOffer = false;
        this.isSettingRemoteDescription = false;
        return;
      }

      console.log('[WebRTC] Setting remote description (offer)');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      
      console.log('[WebRTC] Setting local description (answer)');
      await this.peerConnection.setLocalDescription(answer);

      const callRef = doc(this.firestore, 'calls', this.callId);
      await updateDoc(callRef, {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        answerCreatedAt: serverTimestamp()
      });
      
      console.log('[WebRTC] Answer sent to Firestore');
      
      // Process queued candidates
      await this.processIceCandidateQueue();
    } catch (error) {
      console.error('[WebRTC] Failed to create answer:', error);
      this.hasProcessedOffer = false;
      throw error;
    } finally {
      this.isSettingRemoteDescription = false;
    }
  }

  private async listenForSignaling(): Promise<void> {
    const callRef = doc(this.firestore, 'calls', this.callId);
    
    try {
      // Check for existing offer/answer first
      const initialSnapshot = await getDoc(callRef);
      const initialData = initialSnapshot.data();
      
      if (initialData && !this.isCleanedUp) {
        if (!this.isInitiator && initialData.offer && !this.hasProcessedOffer) {
          console.log('[WebRTC] Found existing offer in Firestore');
          await this.createAnswer(initialData.offer);
        }
        
        if (this.isInitiator && initialData.answer && !this.hasProcessedAnswer) {
          console.log('[WebRTC] Found existing answer in Firestore');
          await this.handleAnswer(initialData.answer);
        }
      }
    } catch (error) {
      console.error('[WebRTC] Error checking initial call state:', error);
    }
    
    // Set up real-time listener
    this.callDocUnsubscribe = onSnapshot(
      callRef, 
      async (snapshot) => {
        if (this.isCleanedUp) {
          console.log('[WebRTC] Ignoring snapshot: service cleaned up');
          return;
        }
        
        const data = snapshot.data();
        if (!data || !this.peerConnection) return;

        if (!this.isInitiator && data.offer && !this.hasProcessedOffer) {
          console.log('[WebRTC] Received offer via listener');
          await this.createAnswer(data.offer);
        }
        
        if (this.isInitiator && data.answer && !this.hasProcessedAnswer) {
          console.log('[WebRTC] Received answer via listener');
          await this.handleAnswer(data.answer);
        }
      }, 
      (error) => {
        console.error('[WebRTC] Error in signaling listener:', error);
      }
    );
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || this.hasProcessedAnswer || this.isCleanedUp) {
      return;
    }
    
    try {
      console.log('[WebRTC] Processing answer...');
      this.hasProcessedAnswer = true;
      this.isSettingRemoteDescription = true;
      
      const currentState = this.peerConnection.signalingState;
      if (currentState === 'have-local-offer') {
        console.log('[WebRTC] Setting remote description (answer)');
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Process queued candidates
        await this.processIceCandidateQueue();
      } else {
        console.warn('[WebRTC] Cannot set answer, wrong signaling state:', currentState);
        this.hasProcessedAnswer = false;
      }
    } catch (error) {
      console.error('[WebRTC] Failed to handle answer:', error);
      this.hasProcessedAnswer = false;
      throw error;
    } finally {
      this.isSettingRemoteDescription = false;
    }
  }
  
  private async processIceCandidateQueue(): Promise<void> {
    if (this.iceCandidateQueue.length === 0) return;
    
    console.log(`[WebRTC] Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
    
    const candidatesToProcess = [...this.iceCandidateQueue];
    this.iceCandidateQueue = [];
    
    for (const candidate of candidatesToProcess) {
      if (this.peerConnection && !this.isCleanedUp) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
          console.log('[WebRTC] Added queued ICE candidate');
        } catch (error) {
          console.error('[WebRTC] Error adding queued ICE candidate:', error);
          // Re-queue failed candidates
          this.iceCandidateQueue.push(candidate);
        }
      }
    }
  }

  private async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (this.isCleanedUp) {
      console.log('[WebRTC] Skipping ICE candidate send: service cleaned up');
      return;
    }
    
    // Create a unique identifier for this candidate
    const candidateKey = `${candidate.candidate}-${candidate.sdpMLineIndex}`;
    
    // Prevent duplicate sends
    if (this.sentIceCandidates.has(candidateKey)) {
      console.log('[WebRTC] Skipping duplicate ICE candidate');
      return;
    }
    
    try {
      this.sentIceCandidates.add(candidateKey);
      
      const candidatesRef = collection(this.firestore, 'calls', this.callId, 'iceCandidates');
      
      // Check if this candidate already exists
      const existingQuery = query(
        candidatesRef,
        where('fromUser', '==', this.userId),
        where('candidate.candidate', '==', candidate.candidate)
      );
      
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        console.log('[WebRTC] ICE candidate already exists in Firestore, skipping');
        return;
      }
      
      await addDoc(candidatesRef, {
        candidate: candidate.toJSON(),
        fromUser: this.userId,
        timestamp: serverTimestamp()
      });
      
      console.log('[WebRTC] ICE candidate sent');
    } catch (error: any) {
      // Remove from sent set on error so we can retry
      this.sentIceCandidates.delete(candidateKey);
      
      // Ignore "already exists" errors
      if (error.code === 'already-exists' || error.message?.includes('already exists')) {
        console.log('[WebRTC] ICE candidate already exists (caught exception)');
        return;
      }
      
      console.error('[WebRTC] Failed to send ICE candidate:', error);
    }
  }

  private listenForIceCandidates(): void {
    const candidatesRef = collection(this.firestore, 'calls', this.callId, 'iceCandidates');

    this.iceCandidateUnsubscribe = onSnapshot(
      candidatesRef, 
      (snapshot) => {
        if (this.isCleanedUp) {
          console.log('[WebRTC] Ignoring ICE candidates: service cleaned up');
          return;
        }
        
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            
            // Only process candidates from the other user
            if (data.fromUser !== this.userId && this.peerConnection) {
              const candidate = new RTCIceCandidate(data.candidate);
              
              // Can only add candidates after remote description is set
              if (this.peerConnection.remoteDescription && !this.isSettingRemoteDescription) {
                try {
                  await this.peerConnection.addIceCandidate(candidate);
                  console.log('[WebRTC] Added ICE candidate');
                } catch (error) {
                  console.error('[WebRTC] Error adding ICE candidate:', error);
                  this.iceCandidateQueue.push(candidate);
                }
              } else {
                console.log('[WebRTC] Queueing ICE candidate (remote description not ready)');
                this.iceCandidateQueue.push(candidate);
              }
            }
          }
        });
      }, 
      (error) => {
        console.error('[WebRTC] Error in ICE candidate listener:', error);
      }
    );
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
        console.log(`[WebRTC] Audio track ${enabled ? 'enabled' : 'disabled'}`);
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
        console.log(`[WebRTC] Video track ${enabled ? 'enabled' : 'disabled'}`);
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
    if (this.isCleanedUp) {
      console.log('[WebRTC] Already cleaned up, skipping');
      return;
    }
    
    console.log('[WebRTC] Cleaning up...');
    this.isCleanedUp = true;
    
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

    // Clear state
    this.remoteStream = null;
    this.hasProcessedOffer = false;
    this.hasProcessedAnswer = false;
    this.isSettingRemoteDescription = false;
    this.iceCandidateQueue = [];
    this.sentIceCandidates.clear();
    this.isInitialized = false;
    this.isInitializing = false;
    
    console.log('[WebRTC] Cleanup complete');
  }
}
