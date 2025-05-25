
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
  private minMantraDuration = 800; // Minimum 0.8 seconds for a mantra
  private silenceGapRequired = 1200; // 1.2 seconds of silence between mantras
  private isInMantra = false;
  private mantraBuffer: number[] = [];
  private backgroundNoiseLevel = 0;
  private noiseCalibrationFrames = 0;
  private isCalibrated = false;

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
      this.analyser.fftSize = 4096; // Higher resolution for better voice detection
      this.analyser.smoothingTimeConstant = 0.05; // Very low smoothing for responsiveness
      
      // Enhanced settings for distant voice detection with noise reduction
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false, 
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      this.isListening = true;
      this.backgroundNoiseLevel = 0;
      this.noiseCalibrationFrames = 0;
      this.isCalibrated = false;
      this.detectSound();
      
      console.log("Enhanced speech detection started with noise calibration");
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
    this.isCalibrated = false;
    console.log("Speech detection stopped");
  }

  private detectSound = (): void => {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Enhanced human voice detection with noise calibration
    const sampleRate = this.audioContext!.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;
    
    // Focus on human voice frequency ranges
    const fundamentalBin = Math.floor(85 / binSize); // 85Hz - lowest male voice
    const upperVoiceBin = Math.floor(1000 / binSize); // 1000Hz - main voice range
    const harmonicBin = Math.floor(4000 / binSize); // 4000Hz - voice harmonics
    
    // Calculate energy in different frequency bands
    const fundamentalEnergy = this.calculateBandEnergy(dataArray, fundamentalBin, Math.floor(300 / binSize));
    const voiceEnergy = this.calculateBandEnergy(dataArray, Math.floor(300 / binSize), upperVoiceBin);
    const harmonicEnergy = this.calculateBandEnergy(dataArray, upperVoiceBin, harmonicBin);
    
    // Human voice signature: strong fundamental + voice range, moderate harmonics
    const voiceScore = (fundamentalEnergy * 0.3) + (voiceEnergy * 0.5) + (harmonicEnergy * 0.2);
    
    // Calibrate background noise for first 60 frames (~2 seconds)
    if (!this.isCalibrated && this.noiseCalibrationFrames < 60) {
      this.backgroundNoiseLevel += voiceScore;
      this.noiseCalibrationFrames++;
      
      if (this.noiseCalibrationFrames === 60) {
        this.backgroundNoiseLevel = this.backgroundNoiseLevel / 60;
        this.isCalibrated = true;
        console.log("Background noise calibrated:", this.backgroundNoiseLevel.toFixed(2));
      }
    }
    
    // Dynamic threshold based on background noise + safety margin
    const dynamicThreshold = this.isCalibrated 
      ? Math.max(2.0, this.backgroundNoiseLevel * 2.5) 
      : 3.0;
    
    // Store recent voice scores for pattern analysis
    this.mantraBuffer.push(voiceScore);
    if (this.mantraBuffer.length > 45) { // Keep last 1.5 seconds at 30fps
      this.mantraBuffer.shift();
    }
    
    const now = Date.now();
    
    if (voiceScore > dynamicThreshold) {
      // Voice detected
      this.consecutiveSpeechFrames++;
      this.consecutiveSilenceFrames = 0;
      
      // Require at least 5 consecutive frames before considering it speech
      if (this.consecutiveSpeechFrames >= 5 && !this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        this.onSpeechDetected();
        console.log("Mantra speech started, voice score:", voiceScore.toFixed(2), "threshold:", dynamicThreshold.toFixed(2));
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

  private calculateBandEnergy(dataArray: Uint8Array, startBin: number, endBin: number): number {
    let energy = 0;
    const validEndBin = Math.min(endBin, dataArray.length);
    
    for (let i = startBin; i < validEndBin; i++) {
      energy += dataArray[i];
    }
    
    return energy / (validEndBin - startBin);
  }
}
