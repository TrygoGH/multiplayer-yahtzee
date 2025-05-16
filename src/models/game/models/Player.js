export class Player {
    constructor({id, name, room, onRoll, onToggleHoldDie, onScore} = {}) {
        this.id = id;
        this.name = name;
        this.room = room;
        this.onRoll = onRoll;
        this.onToggleHoldDie = onToggleHoldDie;
        this.onScore = onScore;
    }

    roll() {
        this.onRoll(this);
    }

    toggleHoldDie(index){
        this.onToggleHoldDie(this, index);
    }

    score(category){
        this.onScore(this, category);
    }
}