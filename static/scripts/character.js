import { loadImage } from "./utils.js"
import { RenderCache } from "./rendercache.js";
import { annualEvents } from "./annualevents.js";

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

    async loadImages(dto)
    {
        const stringToImage = (svgString) => new Promise((resolve) => {
            const img = new Image()
            if (dto.isBase64)
                img.src = "data:image/png;base64," + svgString
            else
                img.src = "data:image/svg+xml;base64," + btoa(svgString)
            img.addEventListener("load", () => resolve(img))
        })

        this.frontSittingImage = RenderCache.Image(await stringToImage(dto.frontSitting), this.scale)
        this.frontStandingImage = RenderCache.Image(await stringToImage(dto.frontStanding), this.scale)
        this.frontWalking1Image = RenderCache.Image(await stringToImage(dto.frontWalking1), this.scale)
        this.frontWalking2Image = RenderCache.Image(await stringToImage(dto.frontWalking2), this.scale)
        this.backSittingImage = RenderCache.Image(await stringToImage(dto.backSitting), this.scale)
        this.backStandingImage = RenderCache.Image(await stringToImage(dto.backStanding), this.scale)
        this.backWalking1Image = RenderCache.Image(await stringToImage(dto.backWalking1), this.scale)
        this.backWalking2Image = RenderCache.Image(await stringToImage(dto.backWalking2), this.scale)
        
        this.frontSittingFlippedImage = RenderCache.Image(await stringToImage(dto.frontSitting), this.scale, true)
        this.frontStandingFlippedImage = RenderCache.Image(await stringToImage(dto.frontStanding), this.scale, true)
        this.frontWalking1FlippedImage = RenderCache.Image(await stringToImage(dto.frontWalking1), this.scale, true)
        this.frontWalking2FlippedImage = RenderCache.Image(await stringToImage(dto.frontWalking2), this.scale, true)
        this.backSittingFlippedImage = RenderCache.Image(await stringToImage(dto.backSitting), this.scale, true)
        this.backStandingFlippedImage = RenderCache.Image(await stringToImage(dto.backStanding), this.scale, true)
        this.backWalking1FlippedImage = RenderCache.Image(await stringToImage(dto.backWalking1), this.scale, true)
        this.backWalking2FlippedImage = RenderCache.Image(await stringToImage(dto.backWalking2), this.scale, true)
        
        // Alternate images
        this.frontSittingImageAlt = RenderCache.Image(await stringToImage(dto.frontSittingAlt || dto.frontSitting), this.scale)
        this.frontStandingImageAlt = RenderCache.Image(await stringToImage(dto.frontStandingAlt || dto.frontStanding), this.scale)
        this.frontWalking1ImageAlt = RenderCache.Image(await stringToImage(dto.frontWalking1Alt || dto.frontWalking1), this.scale)
        this.frontWalking2ImageAlt = RenderCache.Image(await stringToImage(dto.frontWalking2Alt || dto.frontWalking2), this.scale)
        this.backSittingImageAlt = RenderCache.Image(await stringToImage(dto.backSittingAlt || dto.backSitting), this.scale)
        this.backStandingImageAlt = RenderCache.Image(await stringToImage(dto.backStandingAlt || dto.backStanding), this.scale)
        this.backWalking1ImageAlt = RenderCache.Image(await stringToImage(dto.backWalking1Alt || dto.backWalking1), this.scale)
        this.backWalking2ImageAlt = RenderCache.Image(await stringToImage(dto.backWalking2Alt || dto.backWalking2), this.scale)
        
        this.frontSittingFlippedImageAlt = RenderCache.Image(await stringToImage(dto.frontSittingAlt || dto.frontSitting ), this.scale, true)
        this.frontStandingFlippedImageAlt = RenderCache.Image(await stringToImage(dto.frontStandingAlt || dto.frontStanding ), this.scale, true)
        this.frontWalking1FlippedImageAlt = RenderCache.Image(await stringToImage(dto.frontWalking1Alt || dto.frontWalking1 ), this.scale, true)
        this.frontWalking2FlippedImageAlt = RenderCache.Image(await stringToImage(dto.frontWalking2Alt || dto.frontWalking2 ), this.scale, true)
        this.backSittingFlippedImageAlt = RenderCache.Image(await stringToImage(dto.backSittingAlt || dto.backSitting ), this.scale, true)
        this.backStandingFlippedImageAlt = RenderCache.Image(await stringToImage(dto.backStandingAlt || dto.backStanding ), this.scale, true)
        this.backWalking1FlippedImageAlt = RenderCache.Image(await stringToImage(dto.backWalking1Alt || dto.backWalking1 ), this.scale, true)
        this.backWalking2FlippedImageAlt = RenderCache.Image(await stringToImage(dto.backWalking2Alt || dto.backWalking2 ), this.scale, true)
    }
}

export const characters = {
    giko: new Character("giko", "svg", false),
    naito: new Character("naito", "svg", false),
    shii: new Character("shii", "svg", false),
    hikki: new Character("hikki", "svg", false),
    tinpopo: new Character("tinpopo", "svg", false),
    shobon: new Character("shobon", "svg", false),
    nida: new Character("nida", "svg", false),
    salmon: new Character("salmon", "svg", false),
    giko_hat: new Character("giko_hat", "svg", false),
    shii_hat: new Character("shii_hat", "svg", false),
    furoshiki: new Character("furoshiki", "svg", false),
    golden_furoshiki: new Character("golden_furoshiki", "svg", !annualEvents.goldenWeek.isNow()),
    furoshiki_shii: new Character("furoshiki_shii", "svg", annualEvents.spring.isNow()),
    sakura_furoshiki_shii: new Character("sakura_furoshiki_shii", "svg", !annualEvents.spring.isNow()),
    furoshiki_shobon: new Character("furoshiki_shobon", "svg", false),
    naitoapple: new Character("naitoapple", "svg", false),
    shii_pianica: new Character("shii_pianica", "svg", false),
    shii_uniform: new Character("shii_uniform", "svg", false),
    hungry_giko: new Character("hungry_giko", "svg", true),
    rikishi_naito: new Character("rikishi_naito", "svg", true),
    hentai_giko: new Character("hentai_giko", "svg", true),
    shar_naito: new Character("shar_naito", "svg", true),
    dark_naito_walking: new Character("dark_naito_walking", "svg", true),
    ika: new Character("ika", "svg", true),
    takenoko: new Character("takenoko", "svg", true),
    kaminarisama_naito: new Character("kaminarisama_naito", "svg", true),
    panda_naito: new Character("panda_naito", "svg", false),
    wild_panda_naito: new Character("wild_panda_naito", "svg", true),
    funkynaito: new Character("funkynaito", "png", true),
    molgiko: new Character("molgiko", "png", true),
    tikan_giko: new Character("tikan_giko", "svg", true),
    hotsuma_giko: new Character("hotsuma_giko", "svg", false),
    dokuo: new Character("dokuo", "svg", false),
    tabako_dokuo: new Character("tabako_dokuo", "svg", true),
    himawari: new Character("himawari", "svg", true),
    tokita_naito: new Character("tokita_naito", "svg", true),
}

export const loadCharacters = async (crispMode) => {

    const response = await fetch("/characters/" + (crispMode ? "crisp" : "regular"))
    const dto = await response.json()

    return Promise.all(Object.keys(characters).map(characterId => characters[characterId].loadImages(dto[characterId])))
}
