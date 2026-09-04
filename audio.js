/**
 * NEXUS STUDENT OS - AUDIO SYNTHESIZER ENGINE
 * Web Audio API based sound generator for timer chimes & ambient focus audio.
 * Zero external audio assets required.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientNodes = {
      rain: null,
      binaural: null,
      pink: null,
      white: null
    };
    this.ambientState = {
      rain: false,
      binaural: false,
      pink: false,
      white: false
    };
    this.masterGain = null;
    this.activeVolumes = {
      rain: 0.5,
      binaural: 0.5,
      pink: 0.5,
      white: 0.5
    };
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play pleasant harmonic chime when a Pomodoro timer finishes
  playChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad)

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 1.7);
    });
  }

  // Play subtle click / complete pop sound
  playClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Toggle ambient sound generator
  toggleAmbient(type) {
    this.init();
    if (this.ambientState[type]) {
      this.stopAmbient(type);
      return false;
    } else {
      this.startAmbient(type);
      return true;
    }
  }

  setVolume(type, volume) {
    this.activeVolumes[type] = volume;
    if (this.ambientNodes[type] && this.ambientNodes[type].gain) {
      this.ambientNodes[type].gain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    }
  }

  startAmbient(type) {
    this.init();
    if (!this.ctx) return;
    this.stopAmbient(type); // Ensure clean state

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const targetGain = (this.activeVolumes[type] || 0.5) * 0.25;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    gainNode.connect(this.masterGain);

    if (type === 'rain') {
      // Synthesize rain using filtered noise buffer + random raindrop drops
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1000, now);

      whiteNoise.connect(lowpass);
      lowpass.connect(gainNode);
      whiteNoise.start();

      this.ambientNodes.rain = { source: whiteNoise, gain: gainNode };
      this.ambientState.rain = true;

    } else if (type === 'binaural') {
      // Synthesize 10Hz Alpha wave difference for deep focus
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const merger = this.ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(200, now); // 200 Hz Left

      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(210, now); // 210 Hz Right (10Hz binaural beat)

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscL.start();
      oscR.start();

      this.ambientNodes.binaural = { sourceL: oscL, sourceR: oscR, gain: gainNode };
      this.ambientState.binaural = true;

    } else if (type === 'pink') {
      // Pink noise synthesis
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const pinkNoise = this.ctx.createBufferSource();
      pinkNoise.buffer = noiseBuffer;
      pinkNoise.loop = true;
      pinkNoise.connect(gainNode);
      pinkNoise.start();

      this.ambientNodes.pink = { source: pinkNoise, gain: gainNode };
      this.ambientState.pink = true;

    } else if (type === 'white') {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.2;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(gainNode);
      whiteNoise.start();

      this.ambientNodes.white = { source: whiteNoise, gain: gainNode };
      this.ambientState.white = true;
    }
  }

  stopAmbient(type) {
    if (this.ambientNodes[type]) {
      try {
        const node = this.ambientNodes[type];
        if (node.source) node.source.stop();
        if (node.sourceL) node.sourceL.stop();
        if (node.sourceR) node.sourceR.stop();
      } catch (e) {}
      this.ambientNodes[type] = null;
      this.ambientState[type] = false;
    }
  }

  stopAllAmbient() {
    Object.keys(this.ambientNodes).forEach(type => this.stopAmbient(type));
  }
}

window.AppAudio = new SoundEngine();
