import { loadImage } from "./utils.js"
import { RenderCache } from "./rendercache.js";

export class Character
{
    constructor(name, format, isHidden, scale)
    {
        this.characterName = name;
        this.format = format;
        this.isHidden = isHidden
        this.scale = scale || 0.5

        this.frontSittingImage = null;
        this.frontStandingImage = null;
        this.frontWalking1Image = null;
        this.frontWalking2Image = null;
        this.backSittingImage = null;
        this.backStandingImage = null;
        this.backWalking1Image = null;
        this.backWalking2Image = null;
    }

    async loadImages(svgMode)
    {
        const urlMode = (!svgMode || this.format != "svg" ? "" : svgMode + ".");
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
        
        this.frontSittingImage = RenderCache.Image(results[0], this.scale)
        this.frontStandingImage = RenderCache.Image(results[1], this.scale)
        this.frontWalking1Image = RenderCache.Image(results[2], this.scale)
        this.frontWalking2Image = RenderCache.Image(results[3], this.scale)
        this.backSittingImage = RenderCache.Image(results[4], this.scale)
        this.backStandingImage = RenderCache.Image(results[5], this.scale)
        this.backWalking1Image = RenderCache.Image(results[6], this.scale)
        this.backWalking2Image = RenderCache.Image(results[7], this.scale)
        
        this.frontSittingFlippedImage = RenderCache.Image(results[0], this.scale, true)
        this.frontStandingFlippedImage = RenderCache.Image(results[1], this.scale, true)
        this.frontWalking1FlippedImage = RenderCache.Image(results[2], this.scale, true)
        this.frontWalking2FlippedImage = RenderCache.Image(results[3], this.scale, true)
        this.backSittingFlippedImage = RenderCache.Image(results[4], this.scale, true)
        this.backStandingFlippedImage = RenderCache.Image(results[5], this.scale, true)
        this.backWalking1FlippedImage = RenderCache.Image(results[6], this.scale, true)
        this.backWalking2FlippedImage = RenderCache.Image(results[7], this.scale, true)
    }
}

export const characters = {
    giko: new Character("giko", "svg", false),
    naito: new Character("naito", "svg", false),
    funkynaito: new Character("funkynaito", "png", true),
    furoshiki: new Character("furoshiki", "svg", false),
    furoshiki_shii: new Character("furoshiki_shii", "svg", false),
    golden_furoshiki: new Character("golden_furoshiki", "svg", true),
    sakura_furoshiki_shii: new Character("sakura_furoshiki_shii", "svg", true),
    naitoapple: new Character("naitoapple", "svg", false),
    hikki: new Character("hikki", "svg", false),
    tinpopo: new Character("tinpopo", "svg", false),
    shii: new Character("shii", "svg", false),
    shii_pianica: new Character("shii_pianica", "svg", false),
    shii_uniform: new Character("shii_uniform", "svg", false),
    giko_hat: new Character("giko_hat", "svg", false),
    shii_hat: new Character("shii_hat", "svg", false),
    hungry_giko: new Character("hungry_giko", "svg", true),
    rikishi_naito: new Character("rikishi_naito", "svg", true),
    hentai_giko: new Character("hentai_giko", "svg", true),
    shar_naito: new Character("shar_naito", "svg", true),
    dark_naito_walking: new Character("dark_naito_walking", "svg", true),
    shobon: new Character("shobon", "svg", false),
    furoshiki_shobon: new Character("furoshiki_shobon", "svg", false),
    nida: new Character("nida", "svg", false),
    ika: new Character("ika", "svg", true),
    salmon: new Character("salmon", "svg", false),
    takenoko: new Character("takenoko", "svg", true),
    kaminarisama_naito: new Character("kaminarisama_naito", "svg", true),
    panda_naito: new Character("panda_naito", "svg", false),
    wild_panda_naito: new Character("wild_panda_naito", "svg", true),
}

export const loadCharacters = (mode) => Promise.all(Object.values(characters).map(c => c.loadImages(mode)))
