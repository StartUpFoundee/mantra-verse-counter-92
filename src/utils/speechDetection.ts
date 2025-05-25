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
  private speechStartTime = 0;
  private minMantraDuration = 1000; // Minimum 1 second for a mantra
  private silenceGapRequired = 1500; // 1.5 seconds of silence between mantras
  private isInMantra = false;
  private mantraBuffer: number[] = [];

  constructor({ onSpeechDetected, onSpeechEnded, minDecibels = -85 }: SpeechDetectionProps) {
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
      this.analyser.fftSize = 2048; // Increased for better frequency resolution
      this.analyser.smoothingTimeConstant = 0.1; // Very low smoothing for better responsiveness
      
      // Enhanced settings for distant voice detection
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false, // Disabled to capture distant voices
          noiseSuppression: false, // Disabled to avoid filtering out quiet voices
          autoGainControl: true, // Keep for volume normalization
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1
        } 
      });
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isListening = true;
      this.detectSound();
      
      console.log("Enhanced speech detection started for distant voice and long mantras");
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
    this.isInMantra = false;
    this.consecutiveSilenceFrames = 0;
    this.consecutiveSpeechFrames = 0;
    this.mantraBuffer = [];
    console.log("Speech detection stopped");
  }

  private detectSound = (): void => {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Enhanced human voice detection focusing on fundamental frequencies
    // Human voice fundamental frequency range: 85Hz - 300Hz (men), 165Hz - 255Hz (women)
    // But we also check harmonics up to 4000Hz
    const sampleRate = this.audioContext!.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;
    
    // Calculate frequency bins for human voice
    const lowFreqBin = Math.floor(80 / binSize); // 80Hz
    const midFreqBin = Math.floor(500 / binSize); // 500Hz  
    const highFreqBin = Math.floor(4000 / binSize); // 4000Hz
    
    // Analyze different frequency ranges
    const lowFreqData = dataArray.slice(lowFreqBin, Math.floor(300 / binSize));
    const midFreqData = dataArray.slice(Math.floor(300 / binSize), Math.floor(1000 / binSize));
    const highFreqData = dataArray.slice(Math.floor(1000 / binSize), highFreqBin);
    
    const lowAvg = lowFreqData.reduce((acc, val) => acc + val, 0) / lowFreqData.length;
    const midAvg = midFreqData.reduce((acc, val) => acc + val, 0) / midFreqData.length;
    const highAvg = highFreqData.reduce((acc, val) => acc + val, 0) / highFreqData.length;
    
    // Human voice typically has energy in fundamental + harmonics
    const voiceScore = (lowAvg * 0.4) + (midAvg * 0.4) + (highAvg * 0.2);
    
    // Store recent voice scores for pattern analysis
    this.mantraBuffer.push(voiceScore);
    if (this.mantraBuffer.length > 30) { // Keep last 30 frames (~1 second at 30fps)
      this.mantraBuffer.shift();
    }
    
    // Dynamic threshold based on recent activity
    const recentAvg = this.mantraBuffer.reduce((a, b) => a + b, 0) / this.mantraBuffer.length;
    const dynamicThreshold = Math.max(1.5, recentAvg * 0.3); // Adaptive threshold
    
    const now = Date.now();
    
    if (voiceScore > dynamicThreshold) {
      // Voice detected
      this.consecutiveSpeechFrames++;
      this.consecutiveSilenceFrames = 0;
      
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        this.onSpeechDetected();
        console.log("Mantra speech started, voice score:", voiceScore.toFixed(2));
      }
      
      this.lastSpeechTime = now;
      
      // Clear any pending silence timeouts
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
    } else {
      // Silence detected
      this.consecutiveSilenceFrames++;
      this.consecutiveSpeechFrames = 0;
      
      if (this.isSpeaking) {
        const speechDuration = now - this.speechStartTime;
        const silenceDuration = now - this.lastSpeechTime;
        
        // Check if we have sufficient speech duration and silence gap
        if (silenceDuration > this.silenceGapRequired) {
          if (speechDuration >= this.minMantraDuration) {
            console.log(`Mantra completed - Duration: ${speechDuration}ms, Silence: ${silenceDuration}ms`);
            this.isSpeaking = false;
            this.isInMantra = false;
            this.onSpeechEnded();
          } else {
            console.log(`Speech too short (${speechDuration}ms), not counting as mantra`);
            this.isSpeaking = false;
          }
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(this.detectSound);
  };
}
