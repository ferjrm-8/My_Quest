// 16-bit Web Audio API Synthesizer for HeroQuest

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private isBgmPlaying = false;
  private soundEnabled = true;

  private initCtx() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext may be restricted by browser until user gesture
      this.ctx = null;
    }
  }

  public toggleMute(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled && this.isBgmPlaying) {
      this.stopBGM();
    }
    return this.soundEnabled;
  }

  public isMuted(): boolean {
    return !this.soundEnabled;
  }

  // Play a simple retro tone
  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1, delay = 0) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch {
      // Audio might be blocked by browser policy until interaction
    }
  }

  // Dice roll noise & rattle
  public playDiceRoll() {
    if (!this.soundEnabled) return;
    for (let i = 0; i < 6; i++) {
      const f = 200 + Math.random() * 400;
      this.playTone(f, 'triangle', 0.05, 0.08, i * 0.06);
    }
  }

  // Sword strike / attack hit
  public playAttack() {
    if (!this.soundEnabled) return;
    this.playTone(180, 'sawtooth', 0.15, 0.15);
    this.playTone(90, 'square', 0.25, 0.2, 0.05);
  }

  // Shield block sound (metallic ding)
  public playBlock() {
    if (!this.soundEnabled) return;
    this.playTone(700, 'sine', 0.1, 0.15);
    this.playTone(450, 'triangle', 0.2, 0.1, 0.03);
  }

  // Monster defeated / skull impact
  public playDamage() {
    if (!this.soundEnabled) return;
    this.playTone(140, 'square', 0.2, 0.2);
    this.playTone(80, 'sawtooth', 0.3, 0.25, 0.08);
  }

  // Spell cast chime
  public playSpell() {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.25, 0.1, idx * 0.08);
    });
  }

  // Chest / loot sound
  public playLoot() {
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A C# E A
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.18, 0.12, idx * 0.07);
    });
  }

  // Skill unlock / victory fanfare
  public playFanfare() {
    if (!this.soundEnabled) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.35, 0.12, idx * 0.12);
    });
  }

  // Trap trigger warning
  public playTrap() {
    if (!this.soundEnabled) return;
    this.playTone(300, 'sawtooth', 0.15, 0.2);
    this.playTone(200, 'sawtooth', 0.3, 0.2, 0.1);
  }

  // Step / Move sound
  public playStep() {
    if (!this.soundEnabled) return;
    this.playTone(120, 'triangle', 0.04, 0.04);
  }

  // Door opening sound
  public playDoor() {
    if (!this.soundEnabled) return;
    this.playTone(160, 'sawtooth', 0.1, 0.08);
    this.playTone(190, 'sawtooth', 0.15, 0.08, 0.08);
  }

  // 16-bit Dungeon Chiptune BGM loop
  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public getBgmState(): boolean {
    return this.isBgmPlaying;
  }

  private startBGM() {
    if (!this.soundEnabled) return;
    this.initCtx();
    this.isBgmPlaying = true;

    // Atmospheric medieval minor dungeon arpeggio (D minor): D3, F3, A3, D4, C4, A3, F3, E3
    const melody = [
      146.83, 174.61, 220.0, 293.66, 261.63, 220.0, 174.61, 164.81,
      146.83, 174.61, 220.0, 261.63, 246.94, 220.0, 196.0, 164.81,
    ];
    let step = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.soundEnabled) return;
      const freq = melody[step % melody.length];
      this.playTone(freq, 'triangle', 0.28, 0.035);

      // Bass drone every 4 steps
      if (step % 4 === 0) {
        this.playTone(73.42, 'sine', 0.6, 0.05); // D2
      }
      step++;
    }, 280);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audio = new SoundManager();
