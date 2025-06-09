export class PlayerManager{
    constructor(){
        this.players = new Set();
    }

    addPlayer(player){
        this.players.add(player);
    }

    remove(player){
        this.players.delete(player)
    }

    getPlayer(index){
        const playerArray = Array.from(this.players);
        return playerArray[index];
    }
}