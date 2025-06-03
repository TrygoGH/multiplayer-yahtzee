import { TurnHandler } from "../handlers/turnHandler.js";

export class TurnManager{
    constructor(){
        this.playerTurnIndex = 0;
        this.playerList = new Set();
    }

    init(){
        this.playerTurnIndex = 0;
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
        const playerArray = [...this.playerList];
        return playerArray[this.playerTurnIndex];
    }

    isPlayerTurn(player){
        const playerArray = [...this.playerList];
        const isPlayerTurn = playerArray[this.playerTurnIndex] == player;
        return isPlayerTurn;
    }
}