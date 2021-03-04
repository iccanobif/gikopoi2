import { loadImage } from "./utils.js"
import { RenderCache } from "./rendercache.js";

export class Character
{
    constructor(name, format, isHidden, scale, alwaysCrisp)
    {
        this.characterName = name;
        this.format = format;
        this.isHidden = isHidden
        this.scale = scale || 0.5
        this.alwaysCrisp = alwaysCrisp || false

        this.frontSittingImage = null;
        this.frontStandingImage = null;
        this.frontWalking1Image = null;
        this.frontWalking2Image = null;
        this.backSittingImage = null;
        this.backStandingImage = null;
        this.backWalking1Image = null;
        this.backWalking2Image = null;
    }

    async loadImages(crisp)
    {
        if (this.alwaysCrisp) crisp = true;
        
        const urlMode = crisp && this.format == "svg" ? "crisp." : "";
        
        const results = await Promise.all([
            loadImage("characters/" + this.characterName + "/front-sitting." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/front-standing." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/front-walking-1." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/front-walking-2." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/back-sitting." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/back-standing." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/back-walking-1." + urlMode + this.format),
            loadImage("characters/" + this.characterName + "/back-walking-2." + urlMode + this.format)
        ])
        
        const cacheImage = (image) => RenderCache.Image(image, this.scale, false, crisp);
        const cacheFlippedImage = (image) => RenderCache.Image(image, this.scale, true, crisp);
        
        this.frontSittingImage = cacheImage(results[0])
        this.frontStandingImage = cacheImage(results[1])
        this.frontWalking1Image = cacheImage(results[2])
        this.frontWalking2Image = cacheImage(results[3])
        this.backSittingImage = cacheImage(results[4])
        this.backStandingImage = cacheImage(results[5])
        this.backWalking1Image = cacheImage(results[6])
        this.backWalking2Image = cacheImage(results[7])
        
        this.frontSittingFlippedImage = cacheFlippedImage(results[0])
        this.frontStandingFlippedImage = cacheFlippedImage(results[1])
        this.frontWalking1FlippedImage = cacheFlippedImage(results[2])
        this.frontWalking2FlippedImage = cacheFlippedImage(results[3])
        this.backSittingFlippedImage = cacheFlippedImage(results[4])
        this.backStandingFlippedImage = cacheFlippedImage(results[5])
        this.backWalking1FlippedImage = cacheFlippedImage(results[6])
        this.backWalking2FlippedImage = cacheFlippedImage(results[7])
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
    hungry_giko: new Character("hungry_giko", "svg", true),
    rikishi_naito: new Character("rikishi_naito", "svg", true),
    hentai_giko: new Character("hentai_giko", "svg", true),
    shar_naito: new Character("shar_naito", "svg", true),
    dark_naito_walking: new Character("dark_naito_walking", "svg", true),
    shobon: new Character("shobon", "svg", false),
    furoshiki_shobon: new Character("furoshiki_shobon", "png", false),
    nida: new Character("nida", "svg", false),
    shii_uniform: new Character("shii_uniform", "svg", false),
    ika: new Character("ika", "svg", true),
}

export const loadCharacters = (mode) => Promise.all(Object.values(characters).map(c => c.loadImages(mode)))
