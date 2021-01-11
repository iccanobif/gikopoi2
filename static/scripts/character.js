import { loadImage } from "./utils.js"

export class Character
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
        const results = await Promise.all([
            loadImage("characters/" + this.characterName + "/front-sitting.png"),
            loadImage("characters/" + this.characterName + "/front-standing.png"),
            loadImage("characters/" + this.characterName + "/front-walking-1.png"),
            loadImage("characters/" + this.characterName + "/front-walking-2.png"),
            loadImage("characters/" + this.characterName + "/back-sitting.png"),
            loadImage("characters/" + this.characterName + "/back-standing.png"),
            loadImage("characters/" + this.characterName + "/back-walking-1.png"),
            loadImage("characters/" + this.characterName + "/back-walking-2.png")
        ])

        this.frontSittingImage = results[0]
        this.frontStandingImage = results[1]
        this.frontWalking1Image = results[2]
        this.frontWalking2Image = results[3]
        this.backSittingImage = results[4]
        this.backStandingImage = results[5]
        this.backWalking1Image = results[6]
        this.backWalking2Image = results[7]
    }
}

export const characters = {
    giko: new Character("giko"),
    naito: new Character("naito"),
}