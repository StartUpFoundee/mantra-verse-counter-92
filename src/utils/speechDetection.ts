
interface SpeechDetectionProps {
  onSpeechDetected: () => void;
  onSpeechEnded: () => void;
  minDecibels?: number;
}

export class SpeechDetection {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isListening = false;
  private lastSpeechTime = 0;
  private isSpeaking = false;
  private silenceTimeout: number | null = null;
  private animationFrame: number | null = null;
  private onSpeechDetected: () => void;
  private onSpeechEnded: () => void;
  private minDecibels: number;
  private consecutiveSilenceFrames = 0;
  private consecutiveSpeechFrames = 0;

  constructor({ onSpeechDetected, onSpeechEnded, minDecibels = -75 }: SpeechDetectionProps) {
    this.onSpeechDetected = onSpeechDetected;
    this.onSpeechEnded = onSpeechEnded;
    this.minDecibels = minDecibels;
  }

  public async start(): Promise<boolean> {
    try {
      if (this.isListening) return true;
      
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.minDecibels = this.minDecibels;
      this.analyser.fftSize = 512; // Reduced for better performance
      this.analyser.smoothingTimeConstant = 0.3; // Less smoothing for better responsiveness
      
      // Request microphone access with enhanced settings for human voice
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: false, // Disabled to catch quieter voices
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isListening = true;
      this.detectSound();
      
      console.log("Speech detection started with enhanced sensitivity");
      return true;
    } catch (error) {
      console.error("Error starting speech detection:", error);
      return false;
    }
  }

  public stop(): void {
    if (!this.isListening) return;
    
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.consecutiveSilenceFrames = 0;
    this.consecutiveSpeechFrames = 0;
    console.log("Speech detection stopped");
  }

  private detectSound = (): void => {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Enhanced algorithm for human voice detection
    // Focus on human voice frequency range (85Hz - 3000Hz approximately)
    const humanVoiceRange = dataArray.slice(5, 100); // Approximate range for human voice
    const average = humanVoiceRange.reduce((acc, val) => acc + val, 0) / humanVoiceRange.length;
    
    // Much lower threshold for better sensitivity
    const threshold = 2;
    const now = Date.now();
    
    if (average > threshold) {
      // Speech detected
      this.consecutiveSpeechFrames++;
      this.consecutiveSilenceFrames = 0;
      
      // Trigger speech detection immediately for better responsiveness
      if (this.consecutiveSpeechFrames > 1 && !this.isSpeaking) {
        this.isSpeaking = true;
        this.onSpeechDetected();
        console.log("Speech detected with average:", average);
      }
      
      this.lastSpeechTime = now;
      
      // Clear any pending silence timeouts
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
    } else {
      this.consecutiveSilenceFrames++;
      this.consecutiveSpeechFrames = 0;
      
      // Consider speech ended after consistent silence
      if (this.isSpeaking && this.consecutiveSilenceFrames > 15) {
        if (now - this.lastSpeechTime > 500) { // Reduced silence duration
          this.isSpeaking = false;
          this.onSpeechEnded();
          console.log("Speech ended after", now - this.lastSpeechTime, "ms of silence");
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(this.detectSound);
  };
}
