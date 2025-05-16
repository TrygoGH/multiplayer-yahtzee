import { TurnHandler } from "../handlers/turnHandler.js";

export class TurnManager{
    constructor(){
        this.playerTurnIndex = 0;
        this.playerList = new Set();
    }

    init(){
        this.playerTurnIndex = 0;
        this.playerList = new Set();
    }

    addPlayer(player){
        this.playerList.add(player)
    }

    next(){
        const max = this.playerList.size;
        const nextIndex = this.playerTurnIndex + 1;
        this.playerTurnIndex = nextIndex % max;
    }

    getCurrentPlayer(){
        return this.playerList[this.playerTurnIndex];
    }

    isPlayerTurn(player){
        return this.playerList[this.playerTurnIndex] === player;
    }
}