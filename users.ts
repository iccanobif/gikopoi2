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
    public character: 'giko' = 'giko';
    public direction: Direction = defaultRoom.spawnPoint.direction;
    public connected: boolean = true;
    public roomId: string = defaultRoom.id;
    public lastPing = Date.now();
    public mediaStream: MediaStream | null = null;

    constructor(options: { name?: string })
    {
        if (options.name) this.name = options.name
    }
}

const users: { [id: string]: Player; } = {}

export function addNewUser(name: string)
{
    const p = new Player({ name });
    users[p.id] = p;

    return p;
};

export function getConnectedUserList(roomId: string | null): Player[]
{
    // const output: { [id: number]: Player; } = {};
    // for (const u in users)
    //     if (users.hasOwnProperty(u))
    //     {
    //         output[u] = users[u];
    //     }
    // return output;
    if (roomId)
        return Object.values(users).filter(u => u.roomId == roomId)
    else
        return Object.values(users)
};

export function getUser(userId: string)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}
