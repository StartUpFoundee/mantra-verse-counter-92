
export class AudioFeedback {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    this.initializeAudio();
  }
  
  private async initializeAudio() {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }
  }
  
  public playCounterFeedback(count: number): void {
    if (!this.audioContext) return;
    
    try {
      // Create a pleasant chime sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Create a pleasant bell-like tone
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.3);
      
      // Soft envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
      console.log(`Audio feedback played for count: ${count}`);
    } catch (error) {
      console.error("Error playing audio feedback:", error);
    }
  }
  
  public playSuccessSound(): void {
    if (!this.audioContext) return;
    
    try {
      // Play a sequence of ascending tones for success
      const frequencies = [523, 659, 784]; // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        const startTime = this.audioContext!.currentTime + (index * 0.15);
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.error("Error playing success sound:", error);
    }
  }
  
  public destroy(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
