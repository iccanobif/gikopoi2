import { v4 } from "uuid";
import { defaultRoom } from "./rooms";
import { Area, Direction } from "./types";

function generateId()
{
    return v4()
}

const doorId = ("world_spawn" in defaultRoom.doors ? "world_spawn" : defaultRoom.spawnPoint);
const defaultSpawn = defaultRoom.doors[doorId];

export class Player
{
    public id: string = generateId();
    public privateId: string | undefined = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number } = { x: defaultSpawn.x, y: defaultSpawn.y };
    public direction: Direction = (defaultSpawn.direction !== null ? defaultSpawn.direction : "down");
    public lastDirection: Direction | null = null;
    public directionChangedAt: number | null = null;
    public isGhost: boolean = true;
    public roomId: string = defaultRoom.id;
    public lastAction = Date.now();
    public connectionTime = Date.now();
    public disconnectionTime: number | null = null;
    public characterId: string;
    public areaId: Area;
    public isInactive = false;
    public isStreaming = false;
    public bubblePosition: Direction = "up";
    public lastRoomMessage: string = "";
    public ip: string;

    constructor(options: { name?: string, characterId: string, areaId: Area, ip: string })
    {
        if (typeof options.name === "string") this.name = options.name
        this.characterId = options.characterId
        this.areaId = options.areaId
        this.ip = options.ip
    }
}

let users: { [id: string]: Player; } = {}

export function addNewUser(name: string, characterId: string, areaId: Area, ip: string)
{
    const p = new Player({ name, characterId, areaId, ip });
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

export function getUsersByIp(ip: string, areaId: string): Player[]
{
    return Object.values(users)
        .filter(u => u.areaId == areaId)
        .filter(u => u.ip == ip)
}

export function getAllUsers(): Player[]
{
    return Object.values(users)
}

export function getLoginUser(privateId: string)
{
    return Object.values(users)
        .find(u => u.privateId == privateId)
};

export function getUser(userId: string)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}

export function serializeUserState(prettify: boolean): string
{
    if (prettify)
        return JSON.stringify(users, null, 2)
    else
        return JSON.stringify(users)

}

export function deserializeUserState(serializedState: string)
{
    users = JSON.parse(serializedState)

    // Initialize all users as ghosts (they'll be unflagged when users connect again through the websocket)
    for (const user of Object.values(users))
    {
        user.isGhost = true;
    }
    console.info("Restored user state (" + Object.values(users).length + " users)")
}
