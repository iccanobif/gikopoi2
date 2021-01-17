import { v4 } from "uuid";
import { defaultRoom } from "./rooms";
import { Direction } from "./types";

function generateId()
{
    return v4()
}

export class Player
{
    public id: string = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number } = { x: defaultRoom.spawnPoint.x, y: defaultRoom.spawnPoint.y };
    public direction: Direction = defaultRoom.spawnPoint.direction;
    public isGhost: boolean = false;
    public roomId: string = defaultRoom.id;
    public lastPing = Date.now();
    public mediaStream: MediaStream | null = null;
    public characterId: string;
    public areaId: string;

    constructor(options: { name?: string, characterId: string, areaId: string })
    {
        if (options.name) this.name = options.name
        this.characterId = options.characterId
        this.areaId = options.areaId
    }
}

const users: { [id: string]: Player; } = {}

export function addNewUser(name: string, characterId: string, areaId: string)
{
    const p = new Player({ name, characterId, areaId });
    users[p.id] = p;

    return p;
};

export function getConnectedUserList(roomId: string | null, areaId: string | null): Player[]
{
    let output = Object.values(users).filter(u => !u.isGhost)
    if (roomId) output = output.filter(u => u.roomId == roomId)
    if (areaId) output = output.filter(u => u.areaId == areaId)
    return output
};

export function getUser(userId: string)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}
