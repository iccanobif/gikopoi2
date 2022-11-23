import { RenderCache } from "./rendercache.js";
import { annualEvents } from "./annualevents.js";

function isNum(num)
{
    return !isNaN(parseFloat(num))
}

export class Character
{
    constructor(name, format, isHidden, scale, portraitLeft, portraitTop, portraitScale)
    {
        this.characterName = name;
        this.format = format;
        
        this.portraitLeft = isNum(portraitLeft) ? portraitLeft : -0.5;
        this.portraitTop = isNum(portraitTop) ? portraitTop : 0;
        this.portraitScale = isNum(portraitScale) ? portraitScale : 1.9;
        
        console.log(portraitLeft, this.portraitLeft, portraitTop, this.portraitTop, this.portraitScale);
        
        // On new year's, all characters are visible
        this.isHidden = annualEvents.newYears.isNow() ? false : isHidden
        
        this.scale = isNum(scale) ? scale : 0.5;
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
    giko: new Character("giko", "svg", false, null, -0.5, 0.24, null),
    naito: new Character("naito", "svg", false, null, -0.48, 0.13, null),
    shii: new Character("shii", "svg", false, null, -0.5, 0.24, null),
    hikki: new Character("hikki", "svg", false, null, -0.44, -0.12, null),
    tinpopo: new Character("tinpopo", "svg", false, null, -0.5, 0.26, null),
    shobon: new Character("shobon", "svg", false, null, -0.5, -0.2, null),
    nida: new Character("nida", "svg", false, null, -0.5, 0.27, null),
    salmon: new Character("salmon", "svg", false, null, 0.17, -0.54, null),
    giko_hat: new Character("giko_hat", "svg", false, null, -0.5, 0.10, null),
    shii_hat: new Character("shii_hat", "svg", false, null, -0.5, 0.10, null),
    furoshiki: new Character("furoshiki", "svg", false, null, -0.5, 0.24, null),
    golden_furoshiki: new Character("golden_furoshiki", "svg", !annualEvents.goldenWeek.isNow(), null, -0.5, 0.24, null),
    furoshiki_shii: new Character("furoshiki_shii", "svg", annualEvents.spring.isNow(), null, -0.5, 0.24, null),
    sakura_furoshiki_shii: new Character("sakura_furoshiki_shii", "svg", !annualEvents.spring.isNow(), null, -0.5, 0.24, null),
    furoshiki_shobon: new Character("furoshiki_shobon", "svg", false, null, -0.5, -0.2, null),
    naitoapple: new Character("naitoapple", "svg", false, null, -0.5, 0.1, null),
    shii_pianica: new Character("shii_pianica", "svg", false, null, -0.46, 0.24, null),
    shii_uniform: new Character("shii_uniform", "svg", false, null, -0.5, 0.24, null),
    hungry_giko: new Character("hungry_giko", "svg", true, null, -0.45, 0.15, null),
    rikishi_naito: new Character("rikishi_naito", "svg", true, null, -0.30, -0.18, 1.7),
    hentai_giko: new Character("hentai_giko", "svg", true, null, -0.45, 0.33, 1.7),
    shar_naito: new Character("shar_naito", "svg", true, null, -0.48, 0.13, null),
    dark_naito_walking: new Character("dark_naito_walking", "svg", true, null, -0.48, 0.13, null),
    ika: new Character("ika", "svg", true, null, 0, 0.18, 1),
    takenoko: new Character("takenoko", "svg", true, null, 0, 0, 1),
    kaminarisama_naito: new Character("kaminarisama_naito", "svg", true, null, -0.48, 0.13, null),
    panda_naito: new Character("panda_naito", "svg", false, null, -0.48, 0.13, null),
    wild_panda_naito: new Character("wild_panda_naito", "svg", true, null, -0.48, 0.13, null),
    funkynaito: new Character("funkynaito", "png", true, null, -0.48, 0.13, null),
    molgiko: new Character("molgiko", "png", true, null, -0.8, -0.7, null),
    tikan_giko: new Character("tikan_giko", "svg", true, null, -0.5, 0.24, null),
    hotsuma_giko: new Character("hotsuma_giko", "svg", false, null, -0.5, 0.24, null),
    dokuo: new Character("dokuo", "svg", false, null, -0.58, -0.33, null),
    onigiri: new Character("onigiri", "svg", false, null, -0.38, 0.20, 1.7),
    tabako_dokuo: new Character("tabako_dokuo", "svg", true, null, -0.58, -0.33, null),
    himawari: new Character("himawari", "svg", true, null, -0.47, 0, null),
    zonu: new Character("zonu", "svg", false, null, -0.7, -0.46, null),
    george: new Character("george", "svg", false, null, -0.48, 0.13, null),
    chotto_toorimasu_yo: new Character("chotto_toorimasu_yo", "svg", false, null, -0.54, -0.34, null),
    tokita_naito: new Character("tokita_naito", "svg", !annualEvents.spooktober.isNow(), null, -0.40, 0.04, 1.7),
    pumpkinhead: new Character("pumpkinhead", "svg", !annualEvents.spooktober.isNow(), null, -0.74, 0.34, 2.3),
    naito_yurei: new Character("naito_yurei", "svg", !annualEvents.spooktober.isNow(), null, -0.48, 0.13, null),
    shiinigami: new Character("shiinigami", "svg", !annualEvents.spooktober.isNow(), null, -1, 0.02, 2.8),
    youkanman: new Character("youkanman", "svg", true, null, -0.46, -0.5, 1.8),
    baba_shobon: new Character("baba_shobon", "svg", true, null, -0.5, -0.2, null),
    uzukumari: new Character("uzukumari", "svg", false, null, -0.98, -0.69, null),
}

export const loadCharacters = async (crispMode) => {

    const response = await fetch("/characters/" + (crispMode ? "crisp" : "regular"))
    const dto = await response.json()

    return Promise.all(Object.keys(characters).map(characterId => characters[characterId].loadImages(dto[characterId])))
}
