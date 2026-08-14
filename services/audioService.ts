// Universal Audio Service for iOS (Safari/WebKit) & Android (Chrome/WebViews)
// Ensures 100% reliable voice playback for guided meditations & audio passages.

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;
let currentPlayingAudioEl: HTMLAudioElement | null = null;
let currentAudioSourceNode: AudioBufferSourceNode | null = null;
let androidSpeechKeepAliveTimer: any = null;

// Convert 16-bit PCM raw data to WAV Blob
export function pcmBase64ToWavBlob(base64: string, sampleRate = 24000): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Check if RIFF header is already present
  if (bytes.length >= 44 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Create 44-byte WAV header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + bytes.length, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, bytes.length, true);

  const combined = new Uint8Array(44 + bytes.length);
  combined.set(new Uint8Array(header), 0);
  combined.set(bytes, 44);

  return new Blob([combined], { type: 'audio/wav' });
}

// Get or initialize singleton AudioContext
export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }
  return sharedAudioCtx;
}

// Unlock audio playback on iOS & Android via touch/click user gesture
export function unlockMobileAudio(): void {
  if (typeof window === 'undefined') return;
  if (isAudioUnlocked) return;

  try {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Play tiny silent buffer on AudioContext
    if (ctx) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }

    // Warm up HTML5 Audio
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    silentAudio.play().then(() => {
      silentAudio.pause();
    }).catch(() => {});

    // Warm up Web Speech API voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    isAudioUnlocked = true;
  } catch (e) {
    console.warn("[AudioService] Unlock warning:", e);
  }
}

// Stop any active audio playback (HTML5 Audio, Web Audio, or SpeechSynthesis)
export function stopAllAudio(): void {
  if (typeof window === 'undefined') return;

  // Clear Android Speech Keepalive
  if (androidSpeechKeepAliveTimer) {
    clearInterval(androidSpeechKeepAliveTimer);
    androidSpeechKeepAliveTimer = null;
  }

  // Stop Speech Synthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  // Stop HTML5 Audio Element
  if (currentPlayingAudioEl) {
    try {
      currentPlayingAudioEl.pause();
      currentPlayingAudioEl.currentTime = 0;
    } catch (e) {}
    currentPlayingAudioEl = null;
  }

  // Stop Web Audio Source Node
  if (currentAudioSourceNode) {
    try {
      currentAudioSourceNode.stop();
    } catch (e) {}
    currentAudioSourceNode = null;
  }
}

// Play Base64 Audio (tries HTML5 Audio first for iOS/Android native media pipeline, falls back to Web Audio)
export async function playBase64Audio(base64: string, sampleRate = 24000): Promise<boolean> {
  if (!base64 || typeof window === 'undefined') return false;

  stopAllAudio();
  unlockMobileAudio();

  const wavBlob = pcmBase64ToWavBlob(base64, sampleRate);
  const blobUrl = URL.createObjectURL(wavBlob);

  // Strategy 1: HTML5 Audio Element (Works best on iOS & Android)
  const playedViaHTML5 = await new Promise<boolean>((resolve) => {
    try {
      const audio = new Audio();
      audio.src = blobUrl;
      audio.volume = 1.0;
      currentPlayingAudioEl = audio;

      let hasEnded = false;

      audio.onended = () => {
        if (!hasEnded) {
          hasEnded = true;
          currentPlayingAudioEl = null;
          URL.revokeObjectURL(blobUrl);
          resolve(true);
        }
      };

      audio.onerror = () => {
        if (!hasEnded) {
          hasEnded = true;
          currentPlayingAudioEl = null;
          URL.revokeObjectURL(blobUrl);
          resolve(false);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[AudioService] HTMLAudioElement play blocked, trying Web Audio fallback:", err);
          if (!hasEnded) {
            hasEnded = true;
            currentPlayingAudioEl = null;
            URL.revokeObjectURL(blobUrl);
            resolve(false);
          }
        });
      }
    } catch (e) {
      URL.revokeObjectURL(blobUrl);
      resolve(false);
    }
  });

  if (playedViaHTML5) return true;

  // Strategy 2: Web Audio API (AudioContext) Fallback
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const arrayBuffer = await wavBlob.arrayBuffer();
    const audioBuffer = await new Promise<AudioBuffer | null>((resolve) => {
      ctx.decodeAudioData(
        arrayBuffer.slice(0),
        (buf) => resolve(buf),
        () => resolve(null)
      ).catch(() => resolve(null));
    });

    if (!audioBuffer) return false;

    return new Promise<boolean>((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      currentAudioSourceNode = source;

      source.onended = () => {
        currentAudioSourceNode = null;
        resolve(true);
      };

      source.start(0);
    });
  } catch (e) {
    console.warn("[AudioService] Web Audio playback failed:", e);
    return false;
  }
}

// Fallback Speech Synthesis with iOS & Android Keepalive Fixes
export function speakTextWithSynthesis(text: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    stopAllAudio();
    unlockMobileAudio();

    try {
      window.speechSynthesis.cancel();

      // iOS Safari requires small delay after cancel before speak
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'pt-BR';
          utterance.rate = 0.98; // Fluid, natural meditation pace
          utterance.pitch = 1.0;

          // Select best Portuguese voice
          const voices = window.speechSynthesis.getVoices();
          const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
          const femaleVoice = ptVoices.find(v => 
            /google português|natural|luciana|helena|fernanda|francisca|vitoria|marcia|joana|female|feminina/i.test(v.name)
          ) || ptVoices.find(v => !/male|masculino|felipe|daniel|ricardo/i.test(v.name)) || ptVoices[0];

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }

          let isDone = false;

          const finish = (success: boolean) => {
            if (!isDone) {
              isDone = true;
              if (androidSpeechKeepAliveTimer) {
                clearInterval(androidSpeechKeepAliveTimer);
                androidSpeechKeepAliveTimer = null;
              }
              (window as any)._activeUtterance = null;
              resolve(success);
            }
          };

          utterance.onend = () => finish(true);
          utterance.onerror = () => finish(false);

          // Android Chrome Keepalive Hack (prevents speech from stalling on long sentences)
          androidSpeechKeepAliveTimer = setInterval(() => {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            } else {
              clearInterval(androidSpeechKeepAliveTimer);
              androidSpeechKeepAliveTimer = null;
            }
          }, 5000);

          (window as any)._activeUtterance = utterance;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("[AudioService] SpeechSynthesis error:", e);
          resolve(false);
        }
      }, 30);
    } catch (e) {
      resolve(false);
    }
  });
}

// Master function: Plays Base64 AI voice or falls back to Web Speech Synthesis
export async function playVoicePassage(base64Audio: string | null | undefined, text: string): Promise<boolean> {
  if (base64Audio) {
    const success = await playBase64Audio(base64Audio);
    if (success) return true;
  }
  return await speakTextWithSynthesis(text);
}
