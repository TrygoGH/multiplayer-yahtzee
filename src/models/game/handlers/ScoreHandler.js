export class ScoreHandler {
  constructor() {
    this.CATEGORY_BASE_SCORES = null;
  }

  init() {

  }

  useRuleset({ categoryBaseScores }) {
    this.CATEGORY_BASE_SCORES = categoryBaseScores;
  }

  countDice(dice) {
    return dice.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  calculateAllScores(dice) {
    return {
      ones: this.sumOfNumber(dice, 1),
      twos: this.sumOfNumber(dice, 2),
      threes: this.sumOfNumber(dice, 3),
      fours: this.sumOfNumber(dice, 4),
      fives: this.sumOfNumber(dice, 5),
      sixes: this.sumOfNumber(dice, 6),

      three_of_a_kind: this.threeOfAKind(dice),
      four_of_a_kind: this.fourOfAKind(dice),
      full_house: this.fullHouse(dice),
      small_straight: this.smallStraight(dice),
      large_straight: this.largeStraight(dice),
      yahtzee: this.yahtzee(dice),
      chance: this.chance(dice),
    };
  }


  sumOfNumber(dice, number) {
    const numbersToString = {
      1: "ones",
      2: "twos",
      3: "threes",
      4: "fours",
      5: "fives",
      6: "sixes",
    }
    const category = numbersToString[number];
    const { multiplier } = this.CATEGORY_BASE_SCORES[category];
    const sum = dice.filter(die => die === parseInt(number)).reduce((a, b) => a + b, 0);
    return sum * multiplier;
  }

  threeOfAKind(dice) {
    const counts = Object.values(this.countDice(dice));
    const { multiplier } = this.CATEGORY_BASE_SCORES.three_of_a_kind;
    return counts.some(count => count >= 3) ? this.sumAll(dice) * multiplier : 0;
  }

  fourOfAKind(dice) {
    const counts = Object.values(this.countDice(dice));
    const { multiplier } = this.CATEGORY_BASE_SCORES.four_of_a_kind;
    return counts.some(count => count >= 4) ? this.sumAll(dice) * multiplier : 0;
  }

  fullHouse(dice) {
    const counts = Object.values(this.countDice(dice));
    const { value, multiplier } = this.CATEGORY_BASE_SCORES.full_house;
    return counts.includes(3) && counts.includes(2) ? value * multiplier : 0;
  }

  smallStraight(dice) {
    const { value, multiplier } = this.CATEGORY_BASE_SCORES.small_straight;
    const unique = [...new Set(dice)].sort((a, b) => a - b);
    const straights = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];
    return straights.some(seq => seq.every(n => unique.includes(n))) ? value * multiplier : 0;
  }

  largeStraight(dice) {
    const { value, multiplier } = this.CATEGORY_BASE_SCORES.large_straight;
    const unique = [...new Set(dice)].sort((a, b) => a - b);
    const large1 = [1, 2, 3, 4, 5];
    const large2 = [2, 3, 4, 5, 6];
    return (
      large1.every(n => unique.includes(n)) ||
      large2.every(n => unique.includes(n))
    ) ? value * multiplier : 0;
  }

  yahtzee(dice) {
    const { value, multiplier } = this.CATEGORY_BASE_SCORES.yahtzee;
    const counts = Object.values(this.countDice(dice));
    return counts.includes(dice.length) ? value * multiplier : 0;
  }

  chance(dice) {
    const { multiplier } = this.CATEGORY_BASE_SCORES.chance;
    return this.sumAll(dice) * multiplier;
  }

  sumAll(dice) {
    return dice.reduce((sum, die) => sum + die, 0);
  }
}
