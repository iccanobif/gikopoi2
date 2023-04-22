import { RenderCache } from "./rendercache";
import { annualEvents } from "../shared/annualevents";
import { stringToImageList, logToServer } from "./utils";

import type { ImageLayer, CharacterSvgDto } from './types'


type CharacterFormat = "svg" | "png"
const characterVersions = ["normal", "alt"] as const
type CharacterVersion = typeof characterVersions[number]
type CharacterSide = "front" | "back"
const characterStates = ["stand", "sit", "walk1", "walk2"] as const
type CharacterState = typeof characterStates[number]


type RawImages = {
    [key: string]: ImageLayer[]
}

type RenderImage = {
    [key: string]: RenderCache[]
}

const characterFeatureNames = [
    "eyes_open",
    "eyes_closed",
    "mouth_open",
    "mouth_closed",
]

type PortraitProps = {
    left?: number,
    top?: number,
    scale?: number,
}

type ConstructorObject = {
    name: string,
    format?: CharacterFormat,
    isHidden?: boolean,
    scale?: number,
    portrait?: PortraitProps
}

type ImageProps = {
    version: CharacterVersion,
    isShowingBack: boolean,
    state: CharacterState,
    isMirroredLeft: boolean,
    hasEyesClosed: boolean,
    hasMouthClosed: boolean,
}

export class Character
{
    public characterName: string
    public format: CharacterFormat
    public isHidden: boolean
    public portrait: PortraitProps = {
        left: -0.5,
        top: 0,
        scale: 1.9
    }
    private scale: number
    
    private rawImages: RawImages = {}
    private renderImages: RenderImage = {}
    
    constructor({name,
        format = "svg",
        isHidden = false,
        scale = 0.5,
        portrait}: ConstructorObject)
    {
        this.characterName = name;
        this.format = format;
        
        Object.assign(this.portrait, portrait)
        
        // On new year's, all characters are visible
        this.isHidden = annualEvents["newYears"].isNow() ? false : isHidden
        
        this.scale = scale
    }
    
    public getImage({version, isShowingBack, state, isMirroredLeft, hasEyesClosed, hasMouthClosed}: ImageProps)
    {
        let side: CharacterSide = isShowingBack ? "back" : "front"
        // Fallback properties
        if(!this.rawImages[[version, side, state].join(",")])
        {
            version = "normal"
            if(!this.rawImages[[version, side, state].join(",")])
            {
                state = "stand"
                if(!this.rawImages[[version, side, state].join(",")])
                    side = "front"
            }
        }
        const rawImageLayers = this.rawImages[[version, side, state].join(",")]
        if (rawImageLayers == null) return []
        // Not sure why, but rawImageLayers seems to have "undefined" elements sometimes.
        // Maybe that happens when stringToImageList() throws an exception? Logging some info
        // so we can figure out what's going on next time it happens to someone
        const rawImagesLayersNoFalsyElements = rawImageLayers.filter(o => o)
        if (rawImagesLayersNoFalsyElements.length != rawImageLayers.length)
            logToServer("ERROR! falsy element in rawImageLayers, " + this.characterName + " " + JSON.stringify(
                {version, isShowingBack, state, isMirroredLeft, hasEyesClosed, hasMouthClosed}))

        if (!rawImagesLayersNoFalsyElements) return []
        
        const imageKeyArray = [
            version,
            side,
            state,
            isMirroredLeft
        ]

        if (rawImagesLayersNoFalsyElements.find(o => o.tags && o.tags.includes("eyes_closed")))
            imageKeyArray.push(hasEyesClosed)
        if (rawImagesLayersNoFalsyElements.find(o => o.tags && o.tags.includes("mouth_closed")))
            imageKeyArray.push(hasMouthClosed)
        
        const imageKey = imageKeyArray.join(",")
        
        if (this.renderImages[imageKey]) return this.renderImages[imageKey]
        
        const outputLayers = rawImagesLayersNoFalsyElements.filter(o => (!o.tags
            || hasEyesClosed && o.tags.includes("eyes_closed")
            || !hasEyesClosed && o.tags.includes("eyes_open")
            || hasMouthClosed && o.tags.includes("mouth_closed")
            || !hasMouthClosed && o.tags.includes("mouth_open")))
        
        this.renderImages[imageKey] = outputLayers.map(o => RenderCache.Image(o.image, this.scale, isMirroredLeft))
        return this.renderImages[imageKey]
    }

    public async loadImages(dto: CharacterSvgDto)
    {
        const rawImages: RawImages = {}
        const addImageString = async (version: CharacterVersion, side: CharacterSide, state: CharacterState, svgString: string) =>
        {
            rawImages[[version, side, state].join(",")] =
                await stringToImageList(svgString, dto.isBase64)
        }
        
        const promises = [
            addImageString("normal", "front", "stand", dto.frontStanding),
            addImageString("normal", "front", "sit", dto.frontSitting),
            addImageString("normal", "front", "walk1", dto.frontWalking1),
            addImageString("normal", "front", "walk2", dto.frontWalking2),
            addImageString("normal", "back", "stand", dto.backStanding),
            addImageString("normal", "back", "sit", dto.backSitting),
            addImageString("normal", "back", "walk1", dto.backWalking1),
            addImageString("normal", "back", "walk2", dto.backWalking2)
        ]
        
        if (dto.frontStandingAlt) promises.push(addImageString("alt", "front", "stand", dto.frontStandingAlt))
        if (dto.frontSittingAlt) promises.push(addImageString("alt", "front", "sit", dto.frontSittingAlt))
        if (dto.frontWalking1Alt) promises.push(addImageString("alt", "front", "walk1", dto.frontWalking1Alt))
        if (dto.frontWalking2Alt) promises.push(addImageString("alt", "front", "walk2", dto.frontWalking2Alt))
        if (dto.backStandingAlt) promises.push(addImageString("alt", "back", "stand", dto.backStandingAlt))
        if (dto.backSittingAlt) promises.push(addImageString("alt", "back", "sit", dto.backSittingAlt))
        if (dto.backWalking1Alt) promises.push(addImageString("alt", "back", "walk1", dto.backWalking1Alt))
        if (dto.backWalking2Alt) promises.push(addImageString("alt", "back", "walk2", dto.backWalking2Alt))
        
        await Promise.all(promises)
        
        this.rawImages = rawImages
    }
}

export const characters: { [characterId: string]: Character } = {
    giko: new Character({ name: "giko", format: "svg", portrait: { left: -0.5, top: 0.24 } }),
    naito: new Character({ name: "naito", format: "svg", portrait: { left: -0.48, top: 0.13 } }),
    shii: new Character({ name: "shii", format: "svg", portrait: { left: -0.5, top: 0.24 } }),
    hikki: new Character({ name: "hikki", format: "svg", portrait: { left: -0.44, top: -0.12 } }),
    tinpopo: new Character({ name: "tinpopo", format: "svg", portrait: { left: -0.5, top: 0.26 } }),
    shobon: new Character({ name: "shobon", format: "svg", portrait: { left: -0.5, top: -0.2 } }),
    nida: new Character({ name: "nida", format: "svg", portrait: { left: -0.5, top: 0.27 } }),
    salmon: new Character({ name: "salmon", format: "svg", portrait: { left: 0.17, top: -0.54 } }),
    giko_hat: new Character({ name: "giko_hat", format: "svg", portrait: { left: -0.5, top: 0.10 } }),
    shii_hat: new Character({ name: "shii_hat", format: "svg", portrait: { left: -0.5, top: 0.10 } }),
    shobon_hat: new Character({ name: "shobon_hat", format: "svg", isHidden: !annualEvents["christmasTime"].isNow(), portrait: { left: -0.41, top: -0.2 } }),
    furoshiki: new Character({ name: "furoshiki", format: "svg", portrait: { left: -0.5, top: 0.24 } }),
    golden_furoshiki: new Character({ name: "golden_furoshiki", format: "svg", isHidden: !annualEvents["goldenWeek"].isNow(), portrait: { left: -0.5, top: 0.24 } }),
    furoshiki_shii: new Character({ name: "furoshiki_shii", format: "svg", isHidden: annualEvents["spring"].isNow(), portrait: { left: -0.5, top: 0.24 } }),
    sakura_furoshiki_shii: new Character({ name: "sakura_furoshiki_shii", format: "svg", isHidden: !annualEvents["spring"].isNow(), portrait: { left: -0.5, top: 0.24 } }),
    furoshiki_shobon: new Character({ name: "furoshiki_shobon", format: "svg", portrait: { left: -0.41, top: -0.2 } }),
    naitoapple: new Character({ name: "naitoapple", format: "svg", portrait: { left: -0.5, top: 0.1 } }),
    shii_pianica: new Character({ name: "shii_pianica", format: "svg", portrait: { left: -0.46, top: 0.24 } }),
    shii_uniform: new Character({ name: "shii_uniform", format: "svg", portrait: { left: -0.5, top: 0.24 } }),
    hungry_giko: new Character({ name: "hungry_giko", format: "svg", isHidden: true, portrait: { left: -0.45, top: 0.15 } }),
    rikishi_naito: new Character({ name: "rikishi_naito", format: "svg", isHidden: true, portrait: { left: -0.30, top: -0.18, scale: 1.7 } }),
    hentai_giko: new Character({ name: "hentai_giko", format: "svg", isHidden: true, portrait: { left: -0.45, top: 0.33, scale: 1.7 } }),
    shar_naito: new Character({ name: "shar_naito", format: "svg", isHidden: true, portrait: { left: -0.48, top: 0.13 } }),
    dark_naito_walking: new Character({ name: "dark_naito_walking", format: "svg", isHidden: true, portrait: { left: -0.48, top: 0.13 } }),
    ika: new Character({ name: "ika", format: "svg", isHidden: true, portrait: { left: 0, top: 0.18, scale: 1 } }),
    takenoko: new Character({ name: "takenoko", format: "svg", isHidden: true, portrait: { left: 0, top: 0, scale: 1 } }),
    kaminarisama_naito: new Character({ name: "kaminarisama_naito", format: "svg", isHidden: true, portrait: { left: -0.48, top: 0.13 } }),
    panda_naito: new Character({ name: "panda_naito", format: "svg", portrait: { left: -0.48, top: 0.13 } }),
    wild_panda_naito: new Character({ name: "wild_panda_naito", format: "svg", isHidden: true, portrait: { left: -0.48, top: 0.13 } }),
    funkynaito: new Character({ name: "funkynaito", format: "svg", isHidden: true, portrait: { left: -0.48, top: 0.13 } }),
    molgiko: new Character({ name: "molgiko", format: "png", isHidden: true, portrait: { left: -0.8, top: -0.7 } }),
    tikan_giko: new Character({ name: "tikan_giko", format: "svg", isHidden: true, portrait: { left: -0.5, top: 0.24 } }),
    hotsuma_giko: new Character({ name: "hotsuma_giko", format: "svg", portrait: { left: -0.5, top: 0.24 } }),
    dokuo: new Character({ name: "dokuo", format: "svg", portrait: { left: -0.58, top: -0.33 } }),
    onigiri: new Character({ name: "onigiri", format: "svg", portrait: { left: -0.38, top: 0.20, scale: 1.7 } }),
    tabako_dokuo: new Character({ name: "tabako_dokuo", format: "svg", isHidden: true, portrait: { left: -0.58, top: -0.33 } }),
    himawari: new Character({ name: "himawari", format: "svg", isHidden: true, portrait: { left: -0.47, top: 0 } }),
    zonu: new Character({ name: "zonu", format: "svg", portrait: { left: -0.7, top: -0.46 } }),
    george: new Character({ name: "george", format: "svg", portrait: { left: -0.48, top: 0.13 } }),
    chotto_toorimasu_yo: new Character({ name: "chotto_toorimasu_yo", format: "svg", portrait: { left: -0.54, top: -0.34 } }),
    tokita_naito: new Character({ name: "tokita_naito", format: "svg", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.40, top: 0.04, scale: 1.7 } }),
    pumpkinhead: new Character({ name: "pumpkinhead", format: "svg", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.74, top: 0.34, scale: 2.3 } }),
    naito_yurei: new Character({ name: "naito_yurei", format: "svg", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.48, top: 0.13 } }),
    shiinigami: new Character({ name: "shiinigami", format: "svg", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -1, top: 0.02, scale: 2.8 } }),
    youkanman: new Character({ name: "youkanman", format: "svg", isHidden: true, portrait: { left: -0.46, top: -0.5, scale: 1.8 } }),
    baba_shobon: new Character({ name: "baba_shobon", format: "svg", isHidden: true, portrait: { left: -0.5, top: -0.2 } }),
    uzukumari: new Character({ name: "uzukumari", format: "svg", portrait: { left: -0.98, top: -0.69 } }),
}

export const loadCharacters = async (crispMode: boolean) => {

    const response = await fetch("/characters/" + (crispMode ? "crisp" : "regular") + "?v=" + (window as any).EXPECTED_SERVER_VERSION)
    const dto = await response.json()

    return Promise.all(Object.keys(characters).map(characterId => characters[characterId].loadImages(dto[characterId])))
}
