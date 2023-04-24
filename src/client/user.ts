import type { Direction, Room } from './types'
import type { Character, CharacterVersion, CharacterState } from "./character";
import type { RenderCache } from "./rendercache"

import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils";
import { characters } from "./character";

const blinkOpenMinLength = 6000
const blinkOpenLengthVariation = 1000
const blinkClosedLength = 1000

export default class User
{
    public id: string
    public name: string
    public character: Character 
    
    public logicalPositionX: number = 0
    public logicalPositionY: number = 0
    public currentPhysicalPositionX: number = 0
    public currentPhysicalPositionY: number = 0
    public isWalking: boolean = false
    private isSpinning: boolean = false
    private isMoved: boolean = true
    public direction: Direction = "up"
    private stepLength: number = (1000/60) * 8
    private framesUntilNextStep: number
    private frameCount: number = 0
    public isInactive: boolean = false

    public nameImage: RenderCache | null = null

    public message: string | null = null
    public lastMessage: string | null = null
    public lastMovement: number | null = null
    public bubblePosition: Direction = "up"
    public bubbleImage: RenderCache | null = null
    public voicePitch: number | null = null

    public isAlternateCharacter: boolean = false

    private isBlinking: boolean = false
    private blinkingPattern: number[]
    private blinkingStartShift: number
    
    constructor(id: string, name: string, character: Character)
    {
        this.id = id;
        this.name = name;
        // default to giko if the user has somehow set a non-existing character id
        this.character = character || characters.giko; 
        
        if (this.character.characterName ==  "onigiri")
            this.stepLength = (1000/60) * 10
        this.framesUntilNextStep = this.stepLength;
        
        const uniquePattern = id.slice(0, 8) + id.slice(9, 9+4) + id.slice(15, 15+3) + id.slice(20, 20+3) + id.slice(24, 24+12) // this needs an id in the uuid format

        this.blinkingPattern = uniquePattern.slice(2).split("").map(v => parseInt(v, 16)).map((value, index, values) =>
            (values[index] = (values[index-1] || 0) + (blinkOpenMinLength + Math.floor((value/16) * blinkOpenLengthVariation) + blinkClosedLength)))
        this.blinkingStartShift = (parseInt(uniquePattern.slice(0, 2), 16) / 256) * this.blinkingPattern[this.blinkingPattern.length-1]
    }

    moveImmediatelyToPosition(room: Room, logicalPositionX: number, logicalPositionY: number, direction: Direction)
    {
        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;

        const realTargetCoordinates = calculateRealCoordinates(room, this.logicalPositionX, this.logicalPositionY);

        this.currentPhysicalPositionX = realTargetCoordinates.x;
        this.currentPhysicalPositionY = realTargetCoordinates.y;
        this.direction = direction;
        this.isMoved = true;
    }

    moveToPosition(logicalPositionX: number, logicalPositionY: number, direction: Direction)
    {
        if (this.logicalPositionX != logicalPositionX || this.logicalPositionY != logicalPositionY)
        {
            this.isWalking = true;
        }

        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;
        this.direction = direction;
        this.isMoved = true;
    }
    
    calculatePhysicalPosition(room: Room, delta: number)
    {
        if (!this.isWalking)
            return

        if (delta == 0)
            return
            
        const blockWidth = room.blockWidth ? room.blockWidth : BLOCK_WIDTH;
        const blockHeight = room.blockHeight ? room.blockHeight : BLOCK_HEIGHT;
        
        let walkingSpeedX = blockWidth / ( this.character.characterName == "shar_naito" ? 13 : 40)
        let walkingSpeedY = blockHeight / ( this.character.characterName == "shar_naito" ? 13 : 40)

        if (room.id == "long_st")
        {
            walkingSpeedX *= 2;
            walkingSpeedY *= 2;
        }

        // Adjust for delta since last animation frame
        walkingSpeedX *= delta / (1000 / 60)
        walkingSpeedY *= delta / (1000 / 60)

        const realTargetCoordinates = calculateRealCoordinates(room, this.logicalPositionX, this.logicalPositionY);

        const xDelta = Math.min(Math.abs(this.currentPhysicalPositionX - realTargetCoordinates.x), walkingSpeedX)
        const yDelta = Math.min(Math.abs(this.currentPhysicalPositionY - realTargetCoordinates.y), walkingSpeedY)

        if (this.currentPhysicalPositionX > realTargetCoordinates.x) this.currentPhysicalPositionX -= xDelta
        else if (this.currentPhysicalPositionX < realTargetCoordinates.x) this.currentPhysicalPositionX += xDelta

        if (this.currentPhysicalPositionY > realTargetCoordinates.y) this.currentPhysicalPositionY -= yDelta
        else if (this.currentPhysicalPositionY < realTargetCoordinates.y) this.currentPhysicalPositionY += yDelta

        if (xDelta === 0 && yDelta === 0)
        {
            this.isWalking = false;
            this.isSpinning = false;
        }

        this.framesUntilNextStep  -= delta;

        if (this.framesUntilNextStep < 0)
            this.framesUntilNextStep = this.stepLength;

        this.frameCount += delta;
        if (this.frameCount == Number.MAX_SAFE_INTEGER)
            this.frameCount = 0
    }

    getCurrentImage(room: Room): RenderCache[]
    {
        const version: CharacterVersion = this.isAlternateCharacter ? "alt" : "normal"
        let state: CharacterState
        let isShowingBack: boolean
        let isMirroredLeft: boolean
        
        if (this.isSpinning)
        {
            const spinCycle = Math.round((this.frameCount*60/1000) / 2) % 4
            
            state = "walk1"
            isShowingBack = spinCycle == 0 || spinCycle == 1 // direction up or left
            isMirroredLeft = spinCycle == 1 || spinCycle == 2 // direction left or down
        }
        else
        {
            isShowingBack = this.direction == "up" || this.direction == "left"
            isMirroredLeft = this.direction == "left" || this.direction == "down"
            
            if (this.isWalking)
            {
                const walkCycle = this.framesUntilNextStep > this.stepLength / 2
                state = walkCycle ? "walk1" : "walk2"
            }
            else
            {
                const isSitting = !!room.sit.find(s => s.x == this.logicalPositionX && s.y == this.logicalPositionY)
                state = isSitting ? "sit" : "stand"
            }
        }
        
        return this.character.getImage({
            version,
            isShowingBack,
            state,
            isMirroredLeft,
            hasEyesClosed: this.isBlinking || this.isSpinning || this.isInactive
        })
    }
    
    animateBlinking(now: number): boolean
    {
        const currentCycleTime = (now+this.blinkingStartShift) % this.blinkingPattern[this.blinkingPattern.length-1]
        const isBlinking = ((this.blinkingPattern.find(b => currentCycleTime < b)! - currentCycleTime) - blinkClosedLength) <= 0
        if (this.isBlinking != isBlinking)
        {
            this.isBlinking = isBlinking
            return true
        }
        return false
    }
    
    resetBlinking()
    {
        this.isBlinking = false
    }
    
    checkIfRedrawRequired(): boolean
    {
        if (this.isWalking) return true;
        if (this.isMoved)
        {
            this.isMoved = false;
            return true;
        }
        return false
    }

    makeSpin()
    {
        this.isSpinning = true;
    }
}
