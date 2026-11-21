// Web Audio API emergency alert sound generator
class SoundAlertManager {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.intervalId = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSingleBeep(freq = 880, duration = 0.2, type = 'sine') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playEmergencySiren() {
    if (this.isMuted || this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    let toggle = false;
    this.intervalId = setInterval(() => {
      if (this.isMuted) return;
      const freq = toggle ? 960 : 720;
      this.playSingleBeep(freq, 0.35, 'sawtooth');
      toggle = !toggle;
    }, 450);
  }

  stopEmergencySiren() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }

  playAckChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playSingleBeep(freq, 0.25, 'sine');
        }, i * 120);
      });
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEmergencySiren();
    }
    return this.isMuted;
  }
}

export const soundAlert = new SoundAlertManager();
