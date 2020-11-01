import { loadImage } from "./utils.js"

export default class Character
{
    constructor(name)
    {
        this.characterName = name;

        this.frontSittingImage = null;
        this.frontStandingImage = null;
        this.frontWalking1Image = null;
        this.frontWalking2Image = null;
        this.backSittingImage = null;
        this.backStandingImage = null;
        this.backWalking1Image = null;
        this.backWalking2Image = null;
    }

    async loadImages()
    {
        this.frontSittingImage = await loadImage("characters/" + this.characterName + "/front-sitting.png");
        this.frontStandingImage = await loadImage("characters/" + this.characterName + "/front-standing.png");
        this.frontWalking1Image = await loadImage("characters/" + this.characterName + "/front-walking-1.png");
        this.frontWalking2Image = await loadImage("characters/" + this.characterName + "/front-walking-2.png");
        this.backSittingImage = await loadImage("characters/" + this.characterName + "/back-sitting.png");
        this.backStandingImage = await loadImage("characters/" + this.characterName + "/back-standing.png");
        this.backWalking1Image = await loadImage("characters/" + this.characterName + "/back-walking-1.png");
        this.backWalking2Image = await loadImage("characters/" + this.characterName + "/back-walking-2.png");
    }
}