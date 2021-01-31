const WebSocketClient = require('websocket').client;
const WebSocketConnection = require('websocket').client;
import { v4 } from "uuid";

function generateId()
{
    return v4()
}

export interface JanusMessage {
    [key: string]: any;
}

interface SuccessCallback {
    (): void;
}

interface ErrorCallbackInterface {
    (error: any, serverId: string): void;
}

interface MessageCallbackInterface {
    (message: JanusMessage, serverId: string): void;
}

interface IdCallbackInterface {
    (id: string, serverId: string): void
}

export class JanusServer
{
    public errorCallback: ErrorCallbackInterface =
        (error) => console.error(error, this.serverId);
    public messageCallback: MessageCallbackInterface;
    
    public serverId: string;
    private url: string;
    private secret: string;
    private connection: typeof WebSocketConnection | null = null; 
    
    private onTransactionCallbacks: any = {};
    private onSessionCallbacks: any = {};
    
    constructor(serverId: string, url: string, secret: string, messageCallback: MessageCallbackInterface)
    {
        this.serverId = serverId;
        this.url = url;
        this.secret = secret;
        this.messageCallback = messageCallback;
    }
    
    open(callback: SuccessCallback, errorCallback: ErrorCallbackInterface)
    {
        if (this.connection !== null)
        {
            if (this.connection.connected) return;
            this.close()
        }
        
        const ws = new WebSocketClient()
        
        ws.on('connectFailed', (error: any) => {errorCallback(error, this.serverId)})
        ws.on('connect', (connection: typeof WebSocketConnection) =>
        {
            this.connection = connection;
            this.setupCallbacks()
            callback()
        })
        
        ws.connect(this.url, 'janus-protocol');
    }
    
    private setupCallbacks()
    {
        this.connection.on('error', (error: any) => {this.errorCallback(error, this.serverId)});
        this.connection.on('message', (message: JanusMessage) =>
        {
            if (message.type === 'utf8')
            {
                const data = JSON.parse(message.utf8Data);
                if ("transaction" in data && data.transaction in this.onTransactionCallbacks)
                {
                    this.onTransactionCallbacks[data.transaction][0](data, this.serverId)
                    if(this.onTransactionCallbacks[data.transaction][1])
                        delete this.onTransactionCallbacks[data.transaction];
                }
                else if ("session_id" in data && data.session_id in this.onSessionCallbacks)
                {
                    this.onSessionCallbacks[data.transaction][0](data, this.serverId)
                    if(this.onSessionCallbacks[data.transaction][1])
                        delete this.onSessionCallbacks[data.transaction];
                }
                else
                {
                    this.messageCallback(data, this.serverId);
                }
            }
        });
    }
    
    close()
    {
        try
        {
            this.connection.close();
        }
        catch(e){}
        this.connection = null;
    }
    
    send(message: JanusMessage)
    {
        if (!this.connection.connected)
        {
            console.error("Unable to send message. Websocket connection to " + this.url + " closed!")
            return false;
        }
        message.apisecret = this.secret;
        
        console.log("sending", message)
        this.connection.sendUTF(JSON.stringify(message));
        return true;
    }
    
    request(message: JanusMessage, callback: MessageCallbackInterface)
    {
        const transaction = generateId();
        this.onTransaction(transaction, callback, true)
        message.transaction = transaction;
        this.send(message)
    }
    
    createSession(callback: IdCallbackInterface, errorCallback: ErrorCallbackInterface)
    {
        this.request({
            janus: "create"
        }, (msg) =>
        {
            console.log("create session", msg)
            try
            {
                if (msg.janus != "success")
                {
                    errorCallback(msg.error, this.serverId)
                    return;
                };
                callback(msg.data.id, this.serverId);
            }
            catch(e){errorCallback(e, this.serverId)}
        })
    }
    
    attachPlugin(session_id: string, pluginName: string, callback: IdCallbackInterface, errorCallback: ErrorCallbackInterface)
    {
        this.request({
            janus: "attach",
            session_id,
            plugin: pluginName,
        }, (msg) =>
        {
            console.log(session_id, pluginName, "attach plugin", msg)
            try
            {
                if (msg.janus != "success")
                {
                    errorCallback(msg.error, this.serverId)
                    return;
                };
                callback(msg.data.id, this.serverId);
            }
            catch(e){errorCallback(e, this.serverId)}
        })
    }
    
    createRoom(session_id: string, handle_id: string, roomName: string, callback: SuccessCallback, errorCallback: ErrorCallbackInterface)
    {
        this.request({
            janus: "message",
            session_id,
            handle_id,
            body: {
                request: "create",
                room: roomName
            } 
        }, (msg) =>
        {
            console.log(session_id, handle_id, "Create room", msg)
            try
            {
                if (msg.janus != "success")
                {
                    errorCallback(msg.error, this.serverId)
                    return;
                };
                if (msg.plugindata.data.videoroom == "created" ||
                    ("error_code" in msg.plugindata.data && msg.plugindata.data.error_code == 427))
                {
                    callback();
                    return;
                }
                errorCallback("Unknown response", this.serverId)
            }
            catch(e){errorCallback(e, this.serverId)}
        });
    }
    
    onTransaction(transaction: string, callback: MessageCallbackInterface, once?: boolean)
    {
        if (once === undefined) once = false;
        this.onTransactionCallbacks[transaction] = [callback, once];
    }
    
    onSession(session: string, callback: MessageCallbackInterface, once?: boolean)
    {
        if (once === undefined) once = false;
        this.onSessionCallbacks[session] = [callback, once];
    }
}
