import { Scoreboard } from './Scoreboard.js';

export class ScoreboardHandler {
  constructor() {
    this.actual = new Scoreboard();   // Stores confirmed scores
    this.possible = new Scoreboard(); // Stores calculated possible scores
  }

  /**
   * Attempt to score a category in the actual scoreboard.
   * @param {string} category - The category to score.
   * @param {number} value - The score to assign to that category.
   * @returns {Result} Result indicating success or failure.
   */
  score(category, value) {
    return this.actual.score(category, value);
  }

  /**
   * Returns a Scoreboard object with actual scores overriding possible scores.
   * @returns {Scoreboard} A new Scoreboard instance with combined values.
   */
  getCombinedScores() {
    const actualScores = this.actual.getScores();
    const possibleScores = this.possible.getScores();

    const combinedScores = {};
    for (const category in possibleScores) {
      combinedScores[category] =
        actualScores[category] !== null
          ? actualScores[category]
          : possibleScores[category];
    }

    return new Scoreboard(combinedScores);
  }
}
