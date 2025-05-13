class YahtzeeRules {
    constructor({
      maxPlayers = 4,
      rounds = 13,
      rollsPerTurn = 3,
      totalDice = 5,
    } = {}) {
      this.maxPlayers = maxPlayers;
      this.rounds = rounds;
      this.rollsPerTurn = rollsPerTurn;
      this.totalDice = totalDice;
    }
  }
  