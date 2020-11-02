export default class User
{
    constructor(room, name)
    {
        this.room = room;
        this.name = name;

        this.logicalPositionX = 0;
        this.logicalPositionY = 0;
        this.currentPhysicalPositionX = 0;
        this.currentPhysicalPositionY = 0;
    }

    isMoving()
    {
        // TODO calculates the real coordinates of the current logical position
        // and checks if they match the current physical position
    }
}