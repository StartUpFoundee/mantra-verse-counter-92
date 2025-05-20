
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

  constructor({ onSpeechDetected, onSpeechEnded, minDecibels = -65 }: SpeechDetectionProps) {
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
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.9;
      
      // Request microphone access with enhanced settings
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isListening = true;
      this.detectSound();
      
      console.log("Speech detection started successfully");
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

    // Calculate volume level - enhanced algorithm
    const sortedData = [...dataArray].sort((a, b) => b - a);
    const topFrequencies = sortedData.slice(0, Math.floor(dataArray.length * 0.3));
    const average = topFrequencies.reduce((acc, val) => acc + val, 0) / topFrequencies.length;
    
    // Lower threshold to make it much more sensitive
    const threshold = 5;
    const now = Date.now();
    
    if (average > threshold) {
      // Speech detected
      this.consecutiveSpeechFrames++;
      this.consecutiveSilenceFrames = 0;
      
      // Only trigger speech detection after fewer consecutive frames to be more responsive
      if (this.consecutiveSpeechFrames > 2 && !this.isSpeaking) {
        this.isSpeaking = true;
        this.onSpeechDetected();
        console.log("Speech detected", average);
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
      if (this.isSpeaking && this.consecutiveSilenceFrames > 25) {
        if (now - this.lastSpeechTime > 800) {
          this.isSpeaking = false;
          this.onSpeechEnded();
          console.log("Speech ended after", now - this.lastSpeechTime, "ms of silence");
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(this.detectSound);
  };
}
