// utils/globalAudio.ts
type AudioEntry = {
  id: string;
  audio: HTMLAudioElement;
  loop?: boolean;
  fadeDuration?: number;
  previousVolume?: number;
  isPlaying?: boolean;
};

class GlobalAudio {
  private tracks = new Map<string, AudioEntry>();
  private bgm: string | null = null;
  private bgmVolume = 1;
  private ducked = false;
  private muted = false;
  private fadeIntervals: { [key: string]: any } = {};
  private currentlyPlaying: string | null = null;
  private selectedGameTrack: string | null = null; // Track selected for this game session

  register(opts: { id: string; url: string; loop?: boolean; fadeDuration?: number }) {
    const audio = new Audio(opts.url);
    audio.loop = opts.loop ?? false;
    audio.volume = 0;
    if (opts.id === "waitingRoom") {
      audio.play().catch((err) => {
        console.log(`Audio autoplay attempt for waitingRoom:`, err.message);
      });
    }
    this.tracks.set(opts.id, {
      id: opts.id,
      audio,
      loop: audio.loop,
      fadeDuration: opts.fadeDuration ?? 500,
      isPlaying: false,
    });
  }

  private clearFade(id: string) {
    if (this.fadeIntervals[id]) {
      clearInterval(this.fadeIntervals[id]);
      delete this.fadeIntervals[id];
    }
  }

  private stopAllExcept(id?: string) {
    this.tracks.forEach((entry, trackId) => {
      if (id && trackId === id) return;
      if (entry.isPlaying) {
        this.clearFade(trackId);
        entry.audio.pause();
        entry.audio.volume = 0;
        entry.isPlaying = false;
      }
    });
  }

  fadeIn(id: string, target = 1) {
    if (this.muted) return;

    const entry = this.tracks.get(id);
    if (!entry) return;

    this.clearFade(id);

    // Stop all other tracks first
    this.stopAllExcept(id);

    // Start playing this track
    entry.audio.play().catch(() => {});
    entry.isPlaying = true;
    this.currentlyPlaying = id;

    const fadeTime = entry.fadeDuration ?? 500;
    const step = 50;
    const diff = target - entry.audio.volume;
    const delta = diff / (fadeTime / step);

    this.fadeIntervals[id] = setInterval(() => {
      let newVol = entry.audio.volume + delta;
      if (newVol >= target) {
        newVol = target;
        this.clearFade(id);
      }
      entry.audio.volume = newVol;
    }, step);
  }

  fadeOut(id: string) {
    const entry = this.tracks.get(id);
    if (!entry) return;

    this.clearFade(id);

    const fadeTime = entry.fadeDuration ?? 500;
    const step = 50;
    const delta = entry.audio.volume / (fadeTime / step);

    this.fadeIntervals[id] = setInterval(() => {
      let newVol = entry.audio.volume - delta;
      if (newVol <= 0) {
        newVol = 0;
        entry.audio.pause();
        entry.audio.currentTime = 0;
        entry.isPlaying = false;
        if (this.currentlyPlaying === id) {
          this.currentlyPlaying = null;
        }
        this.clearFade(id);
      }
      entry.audio.volume = newVol;
    }, step);
  }

  play(id: string) {
    const entry = this.tracks.get(id);
    if (!entry) return;

    // Stop all other tracks
    this.stopAllExcept(id);

    entry.audio.volume = this.muted ? 0 : 1;
    entry.audio.play().catch(() => {});
    entry.isPlaying = true;
    this.currentlyPlaying = id;
  }

  stop(id: string) {
    const entry = this.tracks.get(id);
    if (!entry) return;
    this.clearFade(id);
    entry.audio.pause(); // Only pause, don't reset currentTime
    entry.audio.volume = 0;
    entry.isPlaying = false;
    if (this.currentlyPlaying === id) {
      this.currentlyPlaying = null;
    }
  }

  // 🎵 Start game music with a specific track
  startGameMusic(trackId?: string) {
    // Stop waiting room
    this.fadeOut("waitingRoom");

    // If no trackId provided, pick a random one
    const selectedTrack = trackId || `play${Math.floor(Math.random() * 4) + 1}`;

    // Store the selected track for this game session
    this.selectedGameTrack = selectedTrack;
    this.bgm = selectedTrack;
    this.bgmVolume = 1;

    // Fade in the selected track
    this.fadeIn(selectedTrack, 1);
  }

  // 🎵 Resume the selected game music (after countdown, between questions, etc.)
  resumeGameMusic() {
    if (!this.selectedGameTrack) {
      // If no track selected yet, pick one randomly
      this.startGameMusic();
      return;
    }

    // Stop waiting room if it's playing
    this.stop("waitingRoom");

    // Fade in the pre-selected game track
    this.fadeIn(this.selectedGameTrack, 1);
  }

  // 🎵 Lower volume for countdown
  duckVolume() {
    if (!this.bgm || this.ducked) return;

    const entry = this.tracks.get(this.bgm);
    if (!entry) return;

    this.ducked = true;
    this.bgmVolume = entry.audio.volume;

    entry.audio.volume = 0.3;
  }

  // 🎵 Restore volume after countdown
  unduckVolume() {
    if (!this.bgm || !this.ducked) return;

    const entry = this.tracks.get(this.bgm);
    if (!entry) return;

    this.ducked = false;
    entry.audio.volume = this.bgmVolume;
  }

  // 🔇 mute toggle
  muteAll() {
    this.muted = true;
    this.tracks.forEach((t) => {
      t.previousVolume = t.audio.volume;
      t.audio.volume = 0;
    });
  }

  unmuteAll() {
    this.muted = false;

    // Only unmute the track that should be playing
    if (this.currentlyPlaying) {
      const entry = this.tracks.get(this.currentlyPlaying);
      if (entry) {
        // Restore to previous volume or default to 1
        entry.audio.volume = entry.previousVolume ?? 1;
        entry.previousVolume = undefined;
      }
    }

    // Keep all other tracks muted
    this.tracks.forEach((t) => {
      if (t.id !== this.currentlyPlaying) {
        t.audio.volume = 0;
      }
    });
  }

  // Get the currently selected game track
  getSelectedGameTrack(): string | null {
    return this.selectedGameTrack;
  }

  // Clear game music selection (for new games)
  clearGameSelection() {
    this.selectedGameTrack = null;
    this.bgm = null;
  }
}

let instance: GlobalAudio | null = null;

export const getGlobalAudio = () => {
  if (!instance) instance = new GlobalAudio();
  return instance;
};
