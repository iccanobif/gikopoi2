import { calculateRealCoordinates, BLOCK_HEIGHT, BLOCK_WIDTH } from "./utils.js";

const STEP_LENGTH = 10;

export default class User
{
    constructor(room, character, name)
    {
        this.room = room;
        this.name = name;
        this.character = character;

        this.logicalPositionX = 0;
        this.logicalPositionY = 0;
        this.currentPhysicalPositionX = 0;
        this.currentPhysicalPositionY = 0;
        this.isWalking = false;
    }

    moveImmediatelyToPosition(logicalPositionX, logicalPositionY)
    {
        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;

        const realTargetCoordinates = calculateRealCoordinates(this.room, this.logicalPositionX, this.logicalPositionY);

        this.currentPhysicalPositionX = realTargetCoordinates.x;
        this.currentPhysicalPositionY = realTargetCoordinates.y;

    }

    moveToPosition(logicalPositionX, logicalPositionY)
    {
        this.logicalPositionX = logicalPositionX;
        this.logicalPositionY = logicalPositionY;
        this.isWalking = true;
    }

    // TODO really, find a better name for this function
    spendTime()
    {
        const walkingSpeedX = BLOCK_WIDTH / 80
        const walkingSpeedY = BLOCK_HEIGHT / 80

        if (!this.isWalking)
            return

        const realTargetCoordinates = calculateRealCoordinates(this.room, this.logicalPositionX, this.logicalPositionY);

        if (this.currentPhysicalPositionX > realTargetCoordinates.x)
            this.currentPhysicalPositionX -= Math.min(this.currentPhysicalPositionX - realTargetCoordinates.x, walkingSpeedX)
        else if (this.currentPhysicalPositionX < realTargetCoordinates.x)
            this.currentPhysicalPositionX += Math.min(realTargetCoordinates.x - this.currentPhysicalPositionX, walkingSpeedX)
        if (this.currentPhysicalPositionY > realTargetCoordinates.y)
            this.currentPhysicalPositionY -= Math.min(this.currentPhysicalPositionY - realTargetCoordinates.y, walkingSpeedY)
        else if (this.currentPhysicalPositionY < realTargetCoordinates.y)
            this.currentPhysicalPositionY += Math.min(realTargetCoordinates.y - this.currentPhysicalPositionY, walkingSpeedY)
        else
            this.isWalking = false
        
    }

    getCurrentImage()
    {
        Date.now()
        if (this.isWalking)
        {
            return this.character.frontWalking1Image;
        }
        else
        {
            return this.character.frontStandingImage;
        }
    }
}