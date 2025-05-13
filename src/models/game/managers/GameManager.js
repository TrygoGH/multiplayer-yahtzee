import { DiceHandler } from "../handlers/DiceHandler.js"
import { TurnHandler } from "../handlers/turnHandler.js";
import { ScoreHandler } from "../handlers/scoreHandler.js";
import { ScoreboardHandler } from "../handlers/ScoreboardHandler.js";

export class GameManager{
    constructor(){
        this.diceHandler = new DiceHandler();
    }
}

//The game manager is a collection of games that associates a set of games with a set of players