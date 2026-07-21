(() => {
const notes = [
  { name: "C4", label: "C", frequency: 261.63, keyType: "white", octave: 4 },
  { name: "C#4", label: "C#", frequency: 277.18, keyType: "black", octave: 4 },
  { name: "D4", label: "D", frequency: 293.66, keyType: "white", octave: 4 },
  { name: "D#4", label: "D#", frequency: 311.13, keyType: "black", octave: 4 },
  { name: "E4", label: "E", frequency: 329.63, keyType: "white", octave: 4 },
  { name: "F4", label: "F", frequency: 349.23, keyType: "white", octave: 4 },
  { name: "F#4", label: "F#", frequency: 369.99, keyType: "black", octave: 4 },
  { name: "G4", label: "G", frequency: 392.0, keyType: "white", octave: 4 },
  { name: "G#4", label: "G#", frequency: 415.3, keyType: "black", octave: 4 },
  { name: "A4", label: "A", frequency: 440.0, keyType: "white", octave: 4 },
  { name: "A#4", label: "A#", frequency: 466.16, keyType: "black", octave: 4 },
  { name: "B4", label: "B", frequency: 493.88, keyType: "white", octave: 4 },
  { name: "C5", label: "C", frequency: 523.25, keyType: "white", octave: 5 },
  { name: "C#5", label: "C#", frequency: 554.37, keyType: "black", octave: 5 },
  { name: "D5", label: "D", frequency: 587.33, keyType: "white", octave: 5 },
  { name: "D#5", label: "D#", frequency: 622.25, keyType: "black", octave: 5 },
  { name: "E5", label: "E", frequency: 659.25, keyType: "white", octave: 5 },
  { name: "F5", label: "F", frequency: 698.46, keyType: "white", octave: 5 },
  { name: "F#5", label: "F#", frequency: 739.99, keyType: "black", octave: 5 },
  { name: "G5", label: "G", frequency: 783.99, keyType: "white", octave: 5 },
  { name: "G#5", label: "G#", frequency: 830.61, keyType: "black", octave: 5 },
  { name: "A5", label: "A", frequency: 880.0, keyType: "white", octave: 5 },
  { name: "A#5", label: "A#", frequency: 932.33, keyType: "black", octave: 5 },
  { name: "B5", label: "B", frequency: 987.77, keyType: "white", octave: 5 },
  { name: "C6", label: "C", frequency: 1046.5, keyType: "white", octave: 6 }
];

const advancedMovementTimeLimit = 8;

const settingLabels = {
  instrument: {
    piano: "Piano"
  },
  mode: {
    "single-note": "Find One Note",
    "pitch-movement": "Pitch Movement"
  },
  difficulty: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced"
  },
  streakTarget: {
    5: "5 Streak",
    10: "10 Streak",
    20: "20 Streak",
    30: "30 Streak"
  }
};

const streakTargets = [5, 10, 20, 30];

const successMessages = {
  clean: ["Case closed.", "Sharp ear.", "Clean solve.", "Right on pitch.", "No clues needed."],
  recovery: ["Good recovery.", "Nice adjustment.", "Found the trail.", "Back on pitch."],
  solved: ["You found it.", "Case solved.", "Nice work.", "Found the note."]
};

const rankLevels = [
  { name: "Beginner", minSolved: 0, minAccuracy: 0, minBestStreak: 0 },
  { name: "Listener", minSolved: 3, minAccuracy: 60, minBestStreak: 2 },
  { name: "Detective", minSolved: 6, minAccuracy: 75, minBestStreak: 3 },
  { name: "Virtuoso", minSolved: 10, minAccuracy: 85, minBestStreak: 5 },
  { name: "Mozart", minSolved: 20, minAccuracy: 90, minBestStreak: 10 }
];

window.MelodyConfig = {
  advancedMovementTimeLimit,
  notes,
  rankLevels,
  settingLabels,
  streakTargets,
  successMessages
};
})();
