import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils";
import { RenderCache } from "./rendercache";
import { Character, characters } from "./character";
import { Direction, PlayerDto, Room } from "./backend/types";

const STEP_LENGTH = 8;

export default class User
{
    id: string;
    name: string;
    character: Character
    logicalPositionX = 0;
    logicalPositionY = 0;
    currentPhysicalPositionX = 0;
    currentPhysicalPositionY = 0;
    isWalking = false;
    isSpinning = false;
    isMoved = true;
    direction: Direction = "up";
    framesUntilNextStep = STEP_LENGTH;
    frameCount = 0
    isInactive = false;
    
    nameImage: RenderCache | null = null;
    
    message: string | null = null;
    lastMessage = null as string | null;
    bubblePosition = "up";
    bubbleImage: RenderCache | null = null;
    voicePitch = 1;
    isAlternateCharacter = false;

    // constructor(character: Character, name: string)
    constructor(userDto: PlayerDto)
    {
        this.id = userDto.id
        this.name = userDto.name;
        // default to giko if the user has somehow set a non-existing character id
        this.character = characters[userDto.characterId] || characters.giko; 
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
            this.isWalking = true;

        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;
        this.direction = direction;
        this.isMoved = true;
    }
    
    calculatePhysicalPosition(room: Room, delta: number)
    {
        if (!this.isWalking)
            return
            
        const blockWidth = room.blockWidth ? room.blockWidth : BLOCK_WIDTH;
        const blockHeight = room.blockHeight ? room.blockHeight : BLOCK_HEIGHT;
        
        let walkingSpeedX = blockWidth / ( this.character.characterName == "shar_naito" ? 13 : 40)
        let walkingSpeedY = blockHeight / ( this.character.characterName == "shar_naito" ? 13 : 40)

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

        this.framesUntilNextStep--
        if (this.framesUntilNextStep < 0)
            this.framesUntilNextStep = STEP_LENGTH

        this.frameCount++
        if (this.frameCount == Number.MAX_SAFE_INTEGER)
            this.frameCount = 0
    }

    getCurrentImage(room: Room)
    {
        const frontSittingImage = this.isAlternateCharacter ? this.character.frontSittingImageAlt : this.character.frontSittingImage;
        const frontStandingImage = this.isAlternateCharacter ? this.character.frontStandingImageAlt : this.character.frontStandingImage;
        const frontWalking1Image = this.isAlternateCharacter ? this.character.frontWalking1ImageAlt : this.character.frontWalking1Image;
        const frontWalking2Image = this.isAlternateCharacter ? this.character.frontWalking2ImageAlt : this.character.frontWalking2Image;
        const backSittingImage = this.isAlternateCharacter ? this.character.backSittingImageAlt : this.character.backSittingImage;
        const backStandingImage = this.isAlternateCharacter ? this.character.backStandingImageAlt : this.character.backStandingImage;
        const backWalking1Image = this.isAlternateCharacter ? this.character.backWalking1ImageAlt : this.character.backWalking1Image;
        const backWalking2Image = this.isAlternateCharacter ? this.character.backWalking2ImageAlt : this.character.backWalking2Image;
        const frontSittingFlippedImage = this.isAlternateCharacter ? this.character.frontSittingFlippedImageAlt : this.character.frontSittingFlippedImage;
        const frontStandingFlippedImage = this.isAlternateCharacter ? this.character.frontStandingFlippedImageAlt : this.character.frontStandingFlippedImage;
        const frontWalking1FlippedImage = this.isAlternateCharacter ? this.character.frontWalking1FlippedImageAlt : this.character.frontWalking1FlippedImage;
        const frontWalking2FlippedImage = this.isAlternateCharacter ? this.character.frontWalking2FlippedImageAlt : this.character.frontWalking2FlippedImage;
        const backSittingFlippedImage = this.isAlternateCharacter ? this.character.backSittingFlippedImageAlt : this.character.backSittingFlippedImage;
        const backStandingFlippedImage = this.isAlternateCharacter ? this.character.backStandingFlippedImageAlt : this.character.backStandingFlippedImage;
        const backWalking1FlippedImage = this.isAlternateCharacter ? this.character.backWalking1FlippedImageAlt : this.character.backWalking1FlippedImage;
        const backWalking2FlippedImage = this.isAlternateCharacter ? this.character.backWalking2FlippedImageAlt : this.character.backWalking2FlippedImage;

        if (this.isSpinning)
        {
            const spinCycle = Math.round(this.frameCount / 2) % 4
            switch (spinCycle)
            {
                case 0:
                    // this.direction = "up"
                    return backWalking1Image;
                case 1:
                    // this.direction = "left"
                    return backWalking1FlippedImage;
                case 2:
                    // this.direction = "down"
                    return frontWalking1FlippedImage;
                case 3:
                    // this.direction = "right"
                    return frontWalking1Image;
            }
        }
        else if (this.isWalking)
        {
            const walkCycle = this.framesUntilNextStep > STEP_LENGTH / 2
            switch (this.direction)
            {
                case "up":
                    return walkCycle ? backWalking1Image : backWalking2Image;
                case "left":
                    return walkCycle ? backWalking1FlippedImage : backWalking2FlippedImage;
                case "down":
                    return walkCycle ? frontWalking1FlippedImage : frontWalking2FlippedImage;
                case "right":
                    return walkCycle ? frontWalking1Image : frontWalking2Image;
            }
        }
        else
        {
            const isSitting = !!room.sit.find(s => s.x == this.logicalPositionX && s.y == this.logicalPositionY)

            switch (this.direction)
            {
                case "up":
                    return isSitting ? backSittingImage : backStandingImage;
                case "left":
                    return isSitting ? backSittingFlippedImage : backStandingFlippedImage;
                case "down":
                    return isSitting ? frontSittingFlippedImage : frontStandingFlippedImage;
                case "right":
                    return isSitting ? frontSittingImage : frontStandingImage;
            }
        }
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
