(() => {
const { notes } = window.MelodyConfig;

const learningProfileStorageKey = "melodyDetectiveLearningProfile";

let learningProfile = loadLearningProfile();

function createFreshLearningProfile() {
  return {
    noteStats: {},
    confusionStats: {},
    totalAttempts: 0,
    totalSolves: 0
  };
}

function loadLearningProfile() {
  try {
    const savedProfile = localStorage.getItem(learningProfileStorageKey);

    if (!savedProfile) {
      return createFreshLearningProfile();
    }

    return {
      ...createFreshLearningProfile(),
      ...JSON.parse(savedProfile)
    };
  } catch (error) {
    return createFreshLearningProfile();
  }
}

function saveLearningProfile() {
  try {
    localStorage.setItem(learningProfileStorageKey, JSON.stringify(learningProfile));
  } catch (error) {
    // If storage is unavailable, the app still works for the current session.
  }
}

function getNoteLearningKey(noteIndex) {
  return notes[noteIndex].label;
}

function getNoteStats(noteKey) {
  if (!learningProfile.noteStats[noteKey]) {
    learningProfile.noteStats[noteKey] = {
      attempts: 0,
      correct: 0,
      misses: 0
    };
  }

  return learningProfile.noteStats[noteKey];
}

function recordLearningAttempt(targetNoteIndex, guessedNoteIndex, wasCorrect) {
  const targetNote = getNoteLearningKey(targetNoteIndex);
  const targetStats = getNoteStats(targetNote);

  targetStats.attempts += 1;
  learningProfile.totalAttempts += 1;

  if (wasCorrect) {
    targetStats.correct += 1;
    learningProfile.totalSolves += 1;
  } else {
    targetStats.misses += 1;

    if (guessedNoteIndex !== null) {
      const guessedNote = getNoteLearningKey(guessedNoteIndex);

      if (guessedNote !== targetNote) {
        const confusionKey = `${targetNote}->${guessedNote}`;
        learningProfile.confusionStats[confusionKey] = (learningProfile.confusionStats[confusionKey] || 0) + 1;
      }
    }
  }

  saveLearningProfile();
}

function getStrongestNoteInsight() {
  const strongNotes = Object.entries(learningProfile.noteStats)
    .map(([note, stats]) => ({
      note,
      attempts: stats.attempts,
      accuracy: stats.attempts === 0 ? 0 : stats.correct / stats.attempts
    }))
    .filter((item) => item.attempts >= 3 && item.accuracy >= 0.75)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts);

  if (strongNotes.length === 0) {
    return learningProfile.totalAttempts >= 3
      ? "Keep solving. Your strongest notes are still forming."
      : "Solve a few notes to reveal your strengths.";
  }

  return `You have a good ear for ${strongNotes[0].note}.`;
}

function getFocusInsight() {
  const commonConfusions = Object.entries(learningProfile.confusionStats)
    .map(([pair, count]) => {
      const [targetNote, guessedNote] = pair.split("->");

      return { targetNote, guessedNote, count };
    })
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count);

  if (commonConfusions.length > 0) {
    const topConfusion = commonConfusions[0];

    return `You sometimes confuse ${topConfusion.targetNote} for ${topConfusion.guessedNote}.`;
  }

  const weakNotes = Object.entries(learningProfile.noteStats)
    .map(([note, stats]) => ({
      note,
      attempts: stats.attempts,
      misses: stats.misses,
      missRate: stats.attempts === 0 ? 0 : stats.misses / stats.attempts
    }))
    .filter((item) => item.attempts >= 3 && item.missRate >= 0.45)
    .sort((a, b) => b.missRate - a.missRate || b.misses - a.misses);

  if (weakNotes.length > 0) {
    return `${weakNotes[0].note} needs a little more attention.`;
  }

  return learningProfile.totalAttempts >= 4
    ? "No clear weak spot yet. Keep collecting clues."
    : "Misses will show which notes need attention.";
}

window.MelodyLearningProfile = {
  getFocusInsight,
  getStrongestNoteInsight,
  recordLearningAttempt
};
})();
