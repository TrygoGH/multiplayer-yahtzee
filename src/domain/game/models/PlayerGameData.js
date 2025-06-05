export class PlayerGameData {
  /**
   * @param {Object} opts
   * @param {Object[]} opts.dice       – Current dice values array  
   * @param {number} opts.rollsLeft    – Rolls remaining this turn  
   * @param {number} opts.turnsLeft    – Turns remaining in game  
   * @param {Object} opts.scores       – Score object per category  
   * @param {number} opts.totalScore   – Sum of all scored categories  
   * @param {boolean} opts.gamestate   – State of the game
   * @param {boolean} opts.isTurn      – If it's the player's turn
   */
  constructor({
    dice,
    rollsLeft,
    turnsLeft,
    scores,
    scoredScores,
    combinedScores,
    gamestate,
    isTurn,
  } = {}) {
    this.dice = dice;
    this.rollsLeft = rollsLeft;
    this.turnsLeft = turnsLeft;
    this.scores = scores;         // e.g. { ones: 3, twos: null, … }
    this.scoredScores = scoredScores;
    this.combinedScores = combinedScores;
    this.gamestate = gamestate;
    this.isTurn = isTurn;
  }

  toPublicData() {
    return {
      dice: this.dice,
      rollsLeft: this.rollsLeft,
      turnsLeft: this.turnsLeft,
      scores: this.scores,
      scoredScores: this.scoredScores,
      combinedScores: this.combinedScores,
      gamestate: this.gamestate,
      isTurn: this.isTurn,
    };
  }

}

