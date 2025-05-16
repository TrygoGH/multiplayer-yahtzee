export class Die{
    constructor({
        value = 1,
        sides = 6,
        isHeld = false
    } = {}){
        this.value = value;
        this.sides = sides;
        this.isHeld = isHeld;
    }
}