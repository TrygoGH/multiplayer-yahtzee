import { Result } from "../../../utils/Result.js";

export class Scoreboard {
  constructor(initialScores) {
    this.scores = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      three_of_a_kind: null,
      four_of_a_kind: null,
      full_house: null,
      small_straight: null,
      large_straight: null,
      yahtzee: null,
      chance: null,
    };

    this.total = 0;
    if (initialScores) {
      this.init(initialScores);
    }
  }

  init(initialScores = {}) {
    this.scores = {
      ...initialScores,
    }
    this.calculateTotal();
  }

  getScores() {
    return { ...this.scores };
  }

  score({ category, value }) {
    this.scores[category] = value;
    this.calculateTotal();
  }

  hasScoredAll(){
    const hasNull = Object.values(obj).some(value => value === null);
    return !hasNull;
  }

  calculateTotal() {
    let total = 0;
    
    for (const [category, value] of Object.entries(this.scores)) {
      total += value;
    }
    this.total = total;
  }
}

