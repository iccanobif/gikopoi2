import { defaultRoom } from "./rooms";

let nextUserID = 1
function generateId()
{
    return nextUserID++;
}

export class Player
{
    public id: number = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number } = { x: defaultRoom.spawnPoint.x, y: defaultRoom.spawnPoint.y };
    public character: 'giko' = 'giko';
    public direction: 'up' | 'down' | 'left' | 'right' = defaultRoom.spawnPoint.direction;
    public connected: boolean = true;
    public roomId: string = defaultRoom.id;
    public lastPing = Date.now();

    constructor(options: { name?: string })
    {
        if (options.name) this.name = options.name
    }
}

const users: { [id: number]: Player; } = {}

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

export function getUser(userId: number)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}