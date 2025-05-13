export class PlayerGameData {
    /**
     * @param {Object} opts
     * @param {number[]} opts.dice       – Current dice values array  
     * @param {boolean[]} opts.held      – Array of held flags (same length as dice)  
     * @param {number} opts.rollsLeft    – Rolls remaining this turn  
     * @param {number} opts.turnsLeft    – Turns remaining in game  
     * @param {Object} opts.scores       – Score object per category  
     * @param {number} opts.totalScore   – Sum of all scored categories  
     */
    constructor({
      dice,
      held,
      rollsLeft,
      turnsLeft,
      scores,
      totalScore
    }) {
      this.dice = dice;             // e.g. [1,4,3,6,2]
      this.held = held;             // e.g. [false,true,false,false,false]
      this.rollsLeft = rollsLeft;   // e.g. 2
      this.turnsLeft = turnsLeft;   // e.g. 12
      this.scores = scores;         // e.g. { ones: 3, twos: null, … }
      this.totalScore = totalScore; // e.g. 15
    }
  }
  