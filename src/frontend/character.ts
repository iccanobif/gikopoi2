import type { ImageLayer, CharacterSvgDto } from './types'

import { RenderCache } from "./rendercache";
import { annualEvents } from "../common/annualevents";
import { stringToImageList, logToServer } from "./utils";


type CharacterFormat = "svg" | "png"
const characterVersions = ["normal", "alt"] as const
export type CharacterVersion = typeof characterVersions[number]
type CharacterSide = "front" | "back"
const characterStates = ["stand", "sit", "walk1", "walk2"] as const
export type CharacterState = typeof characterStates[number]


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

type CharacterObject = {
    name: string,
    format?: CharacterFormat,
    isHidden?: boolean,
    scale?: number,
    portrait?: PortraitProps
}

type CharacterProps = {
    version: CharacterVersion,
    isShowingBack: boolean,
    state: CharacterState,
    isMirroredLeft: boolean,
    hasEyesClosed?: boolean,
    hasMouthClosed?: boolean,
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
    public scale: number // private
    
    public rawImages: RawImages = {} // private
    public renderImages: RenderImage = {} // private
    
    public dto: CharacterSvgDto | null = null // private
    public isLoaded: boolean = false
    
    constructor({name,
        format = "svg",
        isHidden = false,
        scale = 0.5,
        portrait}: CharacterObject)
    {
        this.characterName = name;
        this.format = format;
        
        Object.assign(this.portrait, portrait)
        
        // On new year's, all characters are visible
        this.isHidden = annualEvents["newYears"].isNow() ? false : isHidden
        
        this.scale = scale
    }
    
    public getImage({version='normal', isShowingBack=false, state='stand', isMirroredLeft=false, hasEyesClosed=true, hasMouthClosed=true}: CharacterProps)
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
    
    public setDto(dto: CharacterSvgDto)
    {
        this.dto = dto
        this.isLoaded = false
    }

    // returns true to the first caller to load the character images, indicating a request to redraw
    public async load(): Promise<boolean>
    {
        if (!this.dto) return false
        const dto = this.dto
        this.dto = null
        
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
        
        if (this.dto === null)
        {
            this.rawImages = rawImages
            this.renderImages = {}
            this.isLoaded = true
            return true
        }
        else
        {
            return false // in the meantime a new dto was set and will be loaded instead
        }
    }
}

const characterObjects: CharacterObject[] = [
    { name: "giko", portrait: { left: -0.5, top: 0.24 } },
    { name: "naito", portrait: { left: -0.48, top: 0.13 } },
    { name: "shii", portrait: { left: -0.5, top: 0.24 } },
    { name: "hikki", portrait: { left: -0.44, top: -0.12 } },
    { name: "tinpopo", portrait: { left: -0.5, top: 0.26 } },
    { name: "shobon", portrait: { left: -0.5, top: -0.2 } },
    { name: "nida", portrait: { left: -0.5, top: 0.27 } },
    { name: "salmon", portrait: { left: 0.17, top: -0.54 } },
    { name: "giko_hat", portrait: { left: -0.5, top: 0.10 } },
    { name: "shii_hat", portrait: { left: -0.5, top: 0.10 } },
    { name: "shobon_hat", isHidden: !annualEvents["christmasTime"].isNow(), portrait: { left: -0.41, top: -0.2 } },
    { name: "furoshiki", portrait: { left: -0.5, top: 0.24 } },
    { name: "golden_furoshiki", isHidden: !annualEvents["goldenWeek"].isNow(), portrait: { left: -0.5, top: 0.24 } },
    { name: "furoshiki_shii", isHidden: annualEvents["spring"].isNow(), portrait: { left: -0.5, top: 0.24 } },
    { name: "sakura_furoshiki_shii", isHidden: !annualEvents["spring"].isNow(), portrait: { left: -0.5, top: 0.24 } },
    { name: "furoshiki_shobon", portrait: { left: -0.41, top: -0.2 } },
    { name: "naitoapple", portrait: { left: -0.5, top: 0.1 } },
    { name: "shii_pianica", portrait: { left: -0.46, top: 0.24 } },
    { name: "shii_uniform", portrait: { left: -0.5, top: 0.24 } },
    { name: "hungry_giko", isHidden: true, portrait: { left: -0.45, top: 0.15 } },
    { name: "rikishi_naito", isHidden: true, portrait: { left: -0.30, top: -0.18, scale: 1.7 } },
    { name: "hentai_giko", isHidden: true, portrait: { left: -0.45, top: 0.33, scale: 1.7 } },
    { name: "shar_naito", isHidden: true, portrait: { left: -0.48, top: 0.13 } },
    { name: "dark_naito_walking", isHidden: true, portrait: { left: -0.48, top: 0.13 } },
    { name: "ika", isHidden: true, portrait: { left: 0, top: 0.18, scale: 1 } },
    { name: "takenoko", isHidden: true, portrait: { left: 0, top: 0, scale: 1 } },
    { name: "kaminarisama_naito", isHidden: true, portrait: { left: -0.48, top: 0.13 } },
    { name: "panda_naito", portrait: { left: -0.48, top: 0.13 } },
    { name: "wild_panda_naito", isHidden: true, portrait: { left: -0.48, top: 0.13 } },
    { name: "funkynaito", isHidden: true, portrait: { left: -0.48, top: 0.13 } },
    { name: "molgiko", format: "png", isHidden: true, portrait: { left: -0.8, top: -0.7 } },
    { name: "tikan_giko", isHidden: true, portrait: { left: -0.5, top: 0.24 } },
    { name: "hotsuma_giko", portrait: { left: -0.5, top: 0.24 } },
    { name: "dokuo", portrait: { left: -0.58, top: -0.33 } },
    { name: "onigiri", portrait: { left: -0.38, top: 0.20, scale: 1.7 } },
    { name: "tabako_dokuo", isHidden: true, portrait: { left: -0.58, top: -0.33 } },
    { name: "himawari", isHidden: true, portrait: { left: -0.47, top: 0 } },
    { name: "zonu", portrait: { left: -0.7, top: -0.46 } },
    { name: "george", portrait: { left: -0.48, top: 0.13 } },
    { name: "chotto_toorimasu_yo", portrait: { left: -0.54, top: -0.34 } },
    { name: "tokita_naito", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.40, top: 0.04, scale: 1.7 } },
    { name: "pumpkinhead", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.74, top: 0.34, scale: 2.3 } },
    { name: "naito_yurei", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -0.48, top: 0.13 } },
    { name: "shiinigami", isHidden: !annualEvents["spooktober"].isNow(), portrait: { left: -1, top: 0.02, scale: 2.8 } },
    { name: "youkanman", isHidden: true, portrait: { left: -0.46, top: -0.5, scale: 1.8 } },
    { name: "baba_shobon", isHidden: true, portrait: { left: -0.5, top: -0.2 } },
    { name: "uzukumari", portrait: { left: -0.98, top: -0.69 } },
    { name: "giko_basketball", portrait: { left: -0.5, top: 0.24 } },
]

export const characters: { [characterId: string]: Character } =
    Object.fromEntries(characterObjects.map(o => [o.name, new Character(o)]))

export const loadCharacters = async (crispMode: boolean) => {

    const response = await fetch("/api/characters/" + (crispMode ? "crisp" : "regular") + "?v=" + (window as any).EXPECTED_SERVER_VERSION)
    const dto = await response.json()
    
    Object.keys(characters).forEach(characterId => characters[characterId].setDto(dto[characterId]))
}