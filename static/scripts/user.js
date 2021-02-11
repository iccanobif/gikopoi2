import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils.js";
import { RenderCache } from "./rendercache.js";
import { characters } from "./character.js";

const STEP_LENGTH = 8;
const SPEECH_SPEED = 10;

export default class User
{
    constructor(character, name)
    {
        this.id = null;
        this.name = name;
        // default to giko if the user has somehow set a non-existing character id
        this.character = character || characters.giko; 

        this.logicalPositionX = 0;
        this.logicalPositionY = 0;
        this.currentPhysicalPositionX = 0;
        this.currentPhysicalPositionY = 0;
        this.isWalking = false;
        this.isSpinning = false;
        this.isMoved = true;
        this.direction = "up";
        this.framesUntilNextStep = STEP_LENGTH;
        this.frameCount = 0
        this.framesUntilNextMouthMovement = SPEECH_SPEED;
        this.isInactive = false;

        this.nameImage = null;
        
        this.message = null;
        this.lastMessage = null;
        this.bubblePosition = "up";
        this.bubbleImage = null;
        this.voicePitch = null;
        this.isTalking = false;
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
            this.isWalking = true;

        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;
        this.direction = direction;
        this.isMoved = true;
    }

    calculatePhysicalPosition(room)
    {
        if (!this.isWalking)
            return
            
        const blockWidth = room.blockWidth ? room.blockWidth : BLOCK_WIDTH;
        const blockHeight = room.blockHeight ? room.blockHeight : BLOCK_HEIGHT;
            
        const walkingSpeedX = blockWidth / ( this.character.characterName == "shar_naito" ? 20 : 40)
        const walkingSpeedY = blockHeight / ( this.character.characterName == "shar_naito" ? 20 : 40)

        const walkingSpeedX = BLOCK_WIDTH / (this.character.characterName == "shar_naito" ? 20 : 40)
        const walkingSpeedY = BLOCK_HEIGHT / (this.character.characterName == "shar_naito" ? 20 : 40)

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

        this.framesUntilNextStep--
        if (this.framesUntilNextStep < 0)
            this.framesUntilNextStep = STEP_LENGTH

        this.frameCount++
        if (this.frameCount == Number.MAX_SAFE_INTEGER)
            this.frameCount = 0
    }

    getCurrentImage(room)
    {
        if (this.isSpinning)
        {
            const spinCycle = Math.round(this.frameCount / 2) % 4
            switch (spinCycle)
            {
                case 0:
                    // this.direction = "up"
                    return this.character.backWalking1Image;
                case 1:
                    // this.direction = "left"
                    return this.character.backWalking1FlippedImage;
                case 2:
                    // this.direction = "down"
                    return this.character.frontWalking1FlippedImage;
                case 3:
                    // this.direction = "right"
                    return this.character.frontWalking1Image;
            }
        }
        else if (this.isWalking)
        {
            const walkCycle = this.framesUntilNextStep > STEP_LENGTH / 2
            switch (this.direction)
            {
                case "up":
                    return walkCycle ? this.character.backWalking1Image : this.character.backWalking2Image;
                case "left":
                    return walkCycle ? this.character.backWalking1FlippedImage : this.character.backWalking2FlippedImage;
                case "down":
                    return walkCycle ? this.character.frontWalking1FlippedImage : this.character.frontWalking2FlippedImage;
                case "right":
                    return walkCycle ? this.character.frontWalking1Image : this.character.frontWalking2Image;
            }
        }
        else
        {
            const speechCycle = this.framesUntilNextMouthMovement < SPEECH_SPEED / 2
            const isSitting = !!room.sit.find(s => s.x == this.logicalPositionX && s.y == this.logicalPositionY)

            switch (this.direction)
            {
                case "up":
                    return isSitting ? this.character.backSittingImage : this.character.backStandingImage;
                case "left":
                    return isSitting ? this.character.backSittingFlippedImage : this.character.backStandingFlippedImage;
                case "down":
                    if (speechCycle && this.isTalking)
                        return isSitting ? this.character.frontSittingFlippedImage : this.character.frontStandingAlternateMouthFlippedImage;
                    else
                        return isSitting ? this.character.frontSittingFlippedImage : this.character.frontStandingFlippedImage;
                case "right":
                    if (speechCycle && this.isTalking)
                        return isSitting ? this.character.frontSittingImage : this.character.frontStandingAlternateMouthImage;
                    else
                        return isSitting ? this.character.frontSittingImage : this.character.frontStandingImage;
            }
        }
    }

    checkIfRedrawRequired()
    {
        this.framesUntilNextMouthMovement--
        if (this.framesUntilNextMouthMovement < 0)
            this.framesUntilNextMouthMovement = SPEECH_SPEED

        if (this.isWalking) return true;
        if (this.isTalking) return true;
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
