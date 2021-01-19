import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils.js";

const STEP_LENGTH = 8;

export default class User
{
    constructor(character, name)
    {
        this.name = name;
        this.character = character;

        this.logicalPositionX = 0;
        this.logicalPositionY = 0;
        this.currentPhysicalPositionX = 0;
        this.currentPhysicalPositionY = 0;
        this.isWalking = false;
        this.isHalted = true;
        this.direction = "up";
        this.framesUntilNextStep = STEP_LENGTH
    }

    moveImmediatelyToPosition(room, logicalPositionX, logicalPositionY, direction)
    {
        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;

        const realTargetCoordinates = calculateRealCoordinates(room, this.logicalPositionX, this.logicalPositionY);

        this.currentPhysicalPositionX = realTargetCoordinates.x;
        this.currentPhysicalPositionY = realTargetCoordinates.y;
        this.direction = direction;
        this.isHalted = true;
    }

    moveToPosition(logicalPositionX, logicalPositionY, direction)
    {
        if (this.logicalPositionX != logicalPositionX || this.logicalPositionY != logicalPositionY)
            this.isWalking = true;

        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;
        this.direction = direction;
        this.isHalted = true;
    }

    // TODO really, find a better name for this function
    spendTime(room)
    {
        const walkingSpeedX = BLOCK_WIDTH / 80
        const walkingSpeedY = BLOCK_HEIGHT / 80

        if (!this.isWalking)
            return

        const realTargetCoordinates = calculateRealCoordinates(room, this.logicalPositionX, this.logicalPositionY);

        const xDelta = Math.min(Math.abs(this.currentPhysicalPositionX - realTargetCoordinates.x), walkingSpeedX)
        const yDelta = Math.min(Math.abs(this.currentPhysicalPositionY - realTargetCoordinates.y), walkingSpeedY)

        if (this.currentPhysicalPositionX > realTargetCoordinates.x) this.currentPhysicalPositionX -= xDelta
        else if (this.currentPhysicalPositionX < realTargetCoordinates.x) this.currentPhysicalPositionX += xDelta

        if (this.currentPhysicalPositionY > realTargetCoordinates.y) this.currentPhysicalPositionY -= yDelta
        else if (this.currentPhysicalPositionY < realTargetCoordinates.y) this.currentPhysicalPositionY += yDelta

        if (xDelta === 0 && yDelta === 0)
        {
            this.isHalted = true;
            this.isWalking = false;
        }

        this.framesUntilNextStep--
        if (this.framesUntilNextStep < 0)
            this.framesUntilNextStep = STEP_LENGTH
    }

    getCurrentImage(room)
    {
        if (this.isWalking)
        {
            switch (this.direction)
            {
                case "up":
                case "left":
                    return this.framesUntilNextStep > STEP_LENGTH / 2 ? this.character.backWalking1Image : this.character.backWalking2Image;
                case "down":
                case "right":
                    return this.framesUntilNextStep > STEP_LENGTH / 2 ? this.character.frontWalking1Image : this.character.frontWalking2Image;
            }
        }
        else
        {
            const isSitting = !!room.sit.find(s => s.x == this.logicalPositionX && s.y == this.logicalPositionY)

            switch (this.direction)
            {
                case "up":
                case "left":
                    return isSitting ? this.character.backSittingImage : this.character.backStandingImage;
                case "down":
                case "right":
                    return isSitting ? this.character.frontSittingImage : this.character.frontStandingImage;
            }
        }
    }
    
    checkIfRedrawRequired()
    {
        if (this.isWalking) return true;
        if (this.isHalted)
        {
            this.isHalted = false;
            return true;
        }
    }
}
