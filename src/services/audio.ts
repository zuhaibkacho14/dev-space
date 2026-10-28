/**
 * Gentle Web Audio synthesizer for focus session completion.
 * Does not depend on external mp3/wav files that can fail to load.
 */

let audioCtx: AudioContext | null = null;

export function playCompletionChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Harmonic pleasant bell chime (Fundamental 587.33Hz D5 + 880Hz A5 harmonic)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.8);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now); // A5

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(audioCtx.destination);
    gain2.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.3);
    osc2.stop(now + 1.0);
  } catch {
    // Graceful silent fallback if browser blocks audio
  }
}
