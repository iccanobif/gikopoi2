import { loadImage } from "./utils.js"

export class Character
{
    constructor(name, format, leftFacing)
    {
        this.characterName = name;
        this.format = format;
        this.leftFacing = leftFacing

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
            loadImage("characters/" + this.characterName + "/front-sitting." + this.format),
            loadImage("characters/" + this.characterName + "/front-standing." + this.format),
            loadImage("characters/" + this.characterName + "/front-walking-1." + this.format),
            loadImage("characters/" + this.characterName + "/front-walking-2." + this.format),
            loadImage("characters/" + this.characterName + "/back-sitting." + this.format),
            loadImage("characters/" + this.characterName + "/back-standing." + this.format),
            loadImage("characters/" + this.characterName + "/back-walking-1." + this.format),
            loadImage("characters/" + this.characterName + "/back-walking-2." + this.format)
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
    giko: new Character("giko", "svg", false),
    naito: new Character("naito", "svg", false),
    funkynaito: new Character("funkynaito", "png", true),
    furoshiki: new Character("furoshiki", "svg", false),
    naitoapple: new Character("naitoapple", "svg", false),
    hikki: new Character("hikki", "svg", false),
    tinpopo: new Character("tinpopo", "svg", false),
    shii: new Character("shii", "svg", false),
    shii_pianica: new Character("shii_pianica", "svg", false),
    giko_hat: new Character("giko_hat", "svg", false),
    shii_hat: new Character("shii_hat", "svg", false),
}
