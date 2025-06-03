export const CATEGORIES = {
    ones: "ones",
    twos: "twos",
    threes: "threes",
    fours: "fours",
    fives: "fives",
    sixes: "sixes",
    three_of_a_kind: "three_of_a_kind",
    four_of_a_kind: "four_of_a_kind",
    full_house: "full_house",
    small_straight: "small_straight",
    large_straight: "large_straight",
    yahtzee: "yahtzee",
    chance: "chance"
}

export const CATEGORY_BASE_SCORES = {
    ones: { value: 0, multiplier: 1 },
    twos: { value: 0, multiplier: 1 },
    threes: { value: 0, multiplier: 1 },
    fours: { value: 0, multiplier: 1 },
    fives: { value: 0, multiplier: 1 },
    sixes: { value: 0, multiplier: 1 },
  
    three_of_a_kind: { value: 0, multiplier: 1 },
    four_of_a_kind: { value: 0, multiplier: 1 },
    full_house: { value: 25, multiplier: 1 },
    small_straight: { value: 30, multiplier: 1 },
    large_straight: { value: 40, multiplier: 1 },
    yahtzee: { value: 50, multiplier: 1 },
    chance: { value: 0, multiplier: 1 },
}; 