import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils.js";
import { RenderCache } from "./rendercache.js";
import { characters } from "./character.js";

const blinkOpenMinLength = 6000
const blinkOpenLengthVariation = 1000
const blinkClosedLength = 1000

export default class User
{
    constructor(id, name, character)
    {
        this.id = id;
        this.name = name;
        // default to giko if the user has somehow set a non-existing character id
        this.character = character || characters.giko; 
        
        const uniquePattern = id.slice(0, 8) + id.slice(9, 9+4) + id.slice(15, 15+3) + id.slice(20, 20+3) + id.slice(24, 24+12) // this needs an id in the uuid format

        this.logicalPositionX = 0;
        this.logicalPositionY = 0;
        this.currentPhysicalPositionX = 0;
        this.currentPhysicalPositionY = 0;
        this.isWalking = false;
        this.isSpinning = false;
        this.isMoved = true;
        this.direction = "up";
        this.stepLength = this.character.characterName ==  "onigiri" ? (1000/60) * 10 : (1000/60) * 8;
        this.framesUntilNextStep = this.stepLength;
        this.frameCount = 0
        this.isInactive = false;
        
        this.nameImage = null;
        
        this.message = null;
        this.lastMessage = null;
        this.lastMovement = null;
        this.bubblePosition = "up";
        this.bubbleImage = null;
        this.voicePitch = null;
        
        this.isAlternateCharacter = false
        
        this.isBlinking = false
        this.blinkingPattern = uniquePattern.slice(2).split("").map((value, index, values) =>
            (values[index] = (values[index-1] || 0) + (blinkOpenMinLength + Math.floor((parseInt(value, 16)/16) * blinkOpenLengthVariation) + blinkClosedLength)))
        this.blinkingStartShift = (parseInt(uniquePattern.slice(0, 2), 16) / 256) * this.blinkingPattern[this.blinkingPattern.length-1]
    }

    moveImmediatelyToPosition(room, logicalPositionX, logicalPositionY, direction)
    {
        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;

        const realTargetCoordinates = calculateRealCoordinates(room, this.logicalPositionX, this.logicalPositionY);

        this.currentPhysicalPositionX = realTargetCoordinates.x;
        this.currentPhysicalPositionY = realTargetCoordinates.y;
        this.direction = direction;
        this.isMoved = true;
    }

    moveToPosition(logicalPositionX, logicalPositionY, direction)
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
    
    calculatePhysicalPosition(room, delta)
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

    getCurrentImage(room)
    {
        const charProps = {}
        charProps.version = this.isAlternateCharacter ? "alt" : "normal"
        
        if (this.isSpinning)
        {
            const spinCycle = Math.round((this.frameCount*60/1000) / 2) % 4
            
            charProps.state = "walk1"
            charProps.isShowingBack = spinCycle == 0 || spinCycle == 1 // direction up or left
            charProps.isMirroredLeft = spinCycle == 1 || spinCycle == 2 // direction left or down
        }
        else
        {
            charProps.isShowingBack = this.direction == "up" || this.direction == "left"
            charProps.isMirroredLeft = this.direction == "left" || this.direction == "down"
            
            if (this.isWalking)
            {
                const walkCycle = this.framesUntilNextStep > this.stepLength / 2
                charProps.state = walkCycle ? "walk1" : "walk2"
            }
            else
            {
                const isSitting = !!room.sit.find(s => s.x == this.logicalPositionX && s.y == this.logicalPositionY)
                charProps.state = isSitting ? "sit" : "stand"
            }
        }
        
        charProps.hasEyesClosed = this.isBlinking || this.isSpinning || this.isInactive
        
        return this.character.getImage(charProps)
    }
    
    animateBlinking(now)
    {
        const currentCycleTime = (now+this.blinkingStartShift) % this.blinkingPattern[this.blinkingPattern.length-1]
        const isBlinking = (((this.blinkingPattern.find(b => currentCycleTime <= b) || 0) - currentCycleTime) - blinkClosedLength) <= 0
        if (this.isBlinking != isBlinking)
        {
            this.isBlinking = isBlinking
            return true
        }
    }
    
    resetBlinking()
    {
        this.isBlinking = false
    }
    
    checkIfRedrawRequired()
    {
        if (this.isWalking) return true;
        if (this.isMoved)
        {
            this.isMoved = false;
            return true;
        }
    }

    makeSpin()
    {
        this.isSpinning = true;
    }
}
