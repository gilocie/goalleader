
'use client';

import { useRef, useCallback } from 'react';

export type SoundType = 'call-cuts' | 'call-ring' | 'incoming-tones' | 'message-sent' | 'notifications-tones';

// Create a single Audio instance to be shared across the application
const audio = typeof window !== 'undefined' ? new Audio() : null;

export const useAudioPlayer = () => {
  const playSound = useCallback((type: SoundType, fileName: string = 'default.mp3') => {
    if (!audio) return;

    const soundPath = `/sounds/${type}/${fileName}`;
    const shouldLoop = type === 'call-ring' || type === 'incoming-tones';

    // If the same sound is already playing and supposed to loop, let it be.
    if (audio.src.endsWith(soundPath) && !audio.paused && audio.loop) {
      return;
    }

    // If a different sound is playing, or the current one is not looping, we can interrupt it.
    audio.pause();
    audio.loop = shouldLoop;
    audio.src = soundPath;
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        if (error.name === 'NotAllowedError') {
          console.warn(`[Audio] Autoplay for ${type} was blocked. User interaction is required.`);
        } else {
          console.error(`[Audio] Playback error for ${type}:`, error);
        }
      });
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { playSound, stopAllSounds };
};
