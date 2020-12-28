let nextUserID = 1
function generateId()
{
    return nextUserID++;
}

export class Player
{
    public id: number = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number } = { x: 8, y: 4 };
    public character: 'giko' = 'giko';
    public direction: 'up' | 'down' | 'left' | 'right' = "left";
    public connected: boolean = true;
    public roomId: string = "bar";
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

export function getConnectedUserList(roomId: string | null)
{
    const output: { [id: number]: Player; } = {};
    for (const u in users)
        if (users.hasOwnProperty(u)
            && users[u].connected == true
            && (roomId == null || users[u].roomId == roomId))
        {
            output[u] = users[u];
        }
    return output;
};

export function getUser(userId: number)
{
    return users[userId];
};

