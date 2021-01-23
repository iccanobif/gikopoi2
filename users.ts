import { v4 } from "uuid";
import { defaultRoom } from "./rooms";
import { Direction } from "./types";

function generateId()
{
    return v4()
}

const doorId = ("world_spawn" in defaultRoom.doors ? "world_spawn" : defaultRoom.spawnPoint);
const defaultSpawn = defaultRoom.doors[doorId];

export class Player
{
    public id: string = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number } = { x: defaultSpawn.x, y: defaultSpawn.y };
    public direction: Direction = (defaultSpawn.direction !== null ? defaultSpawn.direction : "down");
    public isGhost: boolean = true;
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

let users: { [id: string]: Player; } = {}

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

export function getGhostUsers(): Player[]
{
    return Object.values(users).filter(u => u.isGhost)
}

export function getUser(userId: string)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}

export function serializeUserState(): string
{
    return JSON.stringify(users)
}

export function deserializeUserState(serializedState: string)
{
    users = JSON.parse(serializedState)

    // Initialize all users as ghosts (they'll be unflagged when users connect again through the websocket)
    for (const user of Object.values(users))
        user.isGhost = true;
    console.log("Restored user state (" + Object.values(users).length + " users)")
}