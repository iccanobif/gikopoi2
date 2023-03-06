import { RenderCache } from "./rendercache.js";
import { annualEvent } from "./annualevents.js";

function isNum(num)
{
    return !isNaN(parseFloat(num))
}

const characterStates = [
    "stand",
    "sit",
    "walk1",
    "walk2"
]

const characterFeatureNames = [
    "eyes_open",
    "eyes_closed",
    "mouth_open",
    "mouth_closed",
]

export class Character
{
    constructor(name, format, isHidden, scale, portraitLeft, portraitTop, portraitScale)
    {
        this.characterName = name;
        this.format = format;
        
        this.portraitLeft = isNum(portraitLeft) ? portraitLeft : -0.5;
        this.portraitTop = isNum(portraitTop) ? portraitTop : 0;
        this.portraitScale = isNum(portraitScale) ? portraitScale : 1.9;
        
        // On new year's, all characters are visible
        this.isHidden = annualEvent("newYears").isNow() ? false : isHidden
        
        this.scale = isNum(scale) ? scale : 0.5;
        
        this.rawImages = {}
        this.renderImages = {}
    }
    
    _validateVersion(version)
    {
        return (version && this.rawImages[version]) ? version : "normal"
    }
    
    _validateState(state)
    {
        return (state && characterStates.includes(state)) ? state : characterStates[0]
    }
    
    _getRawImage(props)
    {
        let rawImageObject = this.rawImages[props.version][props.isShowingBack ? "back" : "front"][props.state]
        if (rawImageObject) return rawImageObject
        props.version = "normal"
        rawImageObject = this.rawImages[props.version][props.isShowingBack ? "back" : "front"][props.state]
        if (rawImageObject) return rawImageObject
        props.state = "stand"
        rawImageObject = this.rawImages[props.version][props.isShowingBack ? "back" : "front"][props.state]
        if (rawImageObject) return rawImageObject
        props.isShowingBack = false
        rawImageObject = this.rawImages[props.version][props.isShowingBack ? "back" : "front"][props.state]
        if (rawImageObject) return rawImageObject
        return null
    }
    
    getImage(props)
    {
        if (!this.rawImages["normal"]) return []
        
        props = {
            version: this._validateVersion(props.version),
            isShowingBack: props.isShowingBack || false,
            state: this._validateState(props.state),
            isMirroredLeft: props.isMirroredLeft || false,
            hasEyesClosed: props.hasEyesClosed || false,
            hasMouthClosed: props.hasMouthClosed || false,
        }
        
        const rawImageLayers = this._getRawImage(props)
        if (!rawImageLayers) return []
        
        const imageKeyArray = [
            props.version,
            props.isShowingBack,
            props.state,
            props.isMirroredLeft
        ]
        
        if (rawImageLayers.find(([key, _]) => key == "eyes_closed"))
            imageKeyArray.push(props.hasEyesClosed)
        if (rawImageLayers.find(([key, _]) => key == "mouth_closed"))
            imageKeyArray.push(props.hasMouthClosed)
        
        const imageKey = imageKeyArray.join(",")
        
        if (this.renderImages[imageKey]) return this.renderImages[imageKey]
        
        const outputLayers = rawImageLayers.filter(([key, _]) => (key == null
            || props.hasEyesClosed && key == "eyes_closed"
            || !props.hasEyesClosed && key == "eyes_open"
            || props.hasMouthClosed && key == "mouth_closed"
            || !props.hasMouthClosed && key == "mouth_open"))
        
        this.renderImages[imageKey] = outputLayers.map(([_, rawImage]) => RenderCache.Image(rawImage, this.scale, props.isMirroredLeft))
        return this.renderImages[imageKey]
    }

    async loadImages(dto)
    {
        const rawImages = {}
        
        const stringToImage = (version, side, state, svgString) => new Promise((resolve) =>
        {
            if (!rawImages[version])
                rawImages[version] = { "front": {}, "back": {} }
            if (dto.isBase64)
            {
                const img = new Image()
                img.src = "data:image/png;base64," + svgString
                img.addEventListener("load", () => 
                {
                    rawImages[version][side][state] = [[ "", img ]]
                    resolve()
                })
                return
            }
            
            const svgDoc = document.createElement("template")
            svgDoc.innerHTML = svgString
            
            const elements = Array.from(svgDoc.content.firstChild.children)
                .filter(el => el.tagName != "defs")
            
            Promise.all(elements
                .reduce((acc, el) =>
            {
                const key = (el.id && el.id.startsWith("gikopoipoi_")) ? el.id.slice(11) : null
                const lastIndex = acc.length - 1
                if (acc.length == 0 || acc[lastIndex][0] != key)
                    acc.push([key, [el]])
                else
                    acc[lastIndex][1].push(el)
                return acc
            }, [])
                .map(([key, layerEls]) =>
            {
                elements.forEach(el => { el.style.display = layerEls.includes(el) ? "inline" : "none" })
                
                const img = new Image()
                img.src = "data:image/svg+xml;base64," + btoa(svgDoc.content.firstChild.outerHTML)
                return new Promise(r => { img.addEventListener("load", () => r([key, img])) })
            }))
                .then(images =>
            {
                rawImages[version][side][state] = images
                resolve()
            })
        })
        
        
        const promises = [
            stringToImage("normal", "front", "stand", dto.frontStanding),
            stringToImage("normal", "front", "sit", dto.frontSitting),
            stringToImage("normal", "front", "walk1", dto.frontWalking1),
            stringToImage("normal", "front", "walk2", dto.frontWalking2),
            stringToImage("normal", "back", "stand", dto.backStanding),
            stringToImage("normal", "back", "sit", dto.backSitting),
            stringToImage("normal", "back", "walk1", dto.backWalking1),
            stringToImage("normal", "back", "walk2", dto.backWalking2)
        ]
        
        if (dto.frontStandingAlt) promises.push(stringToImage("alt", "front", "stand", dto.frontStandingAlt))
        if (dto.frontSittingAlt) promises.push(stringToImage("alt", "front", "sit", dto.frontSittingAlt))
        if (dto.frontWalking1Alt) promises.push(stringToImage("alt", "front", "walk1", dto.frontWalking1Alt))
        if (dto.frontWalking2Alt) promises.push(stringToImage("alt", "front", "walk2", dto.frontWalking2Alt))
        if (dto.backStandingAlt) promises.push(stringToImage("alt", "back", "stand", dto.backStandingAlt))
        if (dto.backSittingAlt) promises.push(stringToImage("alt", "back", "sit", dto.backSittingAlt))
        if (dto.backWalking1Alt) promises.push(stringToImage("alt", "back", "walk1", dto.backWalking1Alt))
        if (dto.backWalking2Alt) promises.push(stringToImage("alt", "back", "walk2", dto.backWalking2Alt))
        
        await Promise.all(promises)
        
        this.rawImages = rawImages
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
    shobon_hat: new Character("shobon_hat", "svg", !annualEvent("christmasTime").isNow(), null, -0.41, -0.2, null),
    furoshiki: new Character("furoshiki", "svg", false, null, -0.5, 0.24, null),
    golden_furoshiki: new Character("golden_furoshiki", "svg", !annualEvent("goldenWeek").isNow(), null, -0.5, 0.24, null),
    furoshiki_shii: new Character("furoshiki_shii", "svg", annualEvent("spring").isNow(), null, -0.5, 0.24, null),
    sakura_furoshiki_shii: new Character("sakura_furoshiki_shii", "svg", !annualEvent("spring").isNow(), null, -0.5, 0.24, null),
    furoshiki_shobon: new Character("furoshiki_shobon", "svg", false, null, -0.41, -0.2, null),
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
    tokita_naito: new Character("tokita_naito", "svg", !annualEvent("spooktober").isNow(), null, -0.40, 0.04, 1.7),
    pumpkinhead: new Character("pumpkinhead", "svg", !annualEvent("spooktober").isNow(), null, -0.74, 0.34, 2.3),
    naito_yurei: new Character("naito_yurei", "svg", !annualEvent("spooktober").isNow(), null, -0.48, 0.13, null),
    shiinigami: new Character("shiinigami", "svg", !annualEvent("spooktober").isNow(), null, -1, 0.02, 2.8),
    youkanman: new Character("youkanman", "svg", true, null, -0.46, -0.5, 1.8),
    baba_shobon: new Character("baba_shobon", "svg", true, null, -0.5, -0.2, null),
    uzukumari: new Character("uzukumari", "svg", false, null, -0.98, -0.69, null),
}

export const loadCharacters = async (crispMode) => {

    const response = await fetch("/characters/" + (crispMode ? "crisp" : "regular"))
    const dto = await response.json()

    return Promise.all(Object.keys(characters).map(characterId => characters[characterId].loadImages(dto[characterId])))
}
