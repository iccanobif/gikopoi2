const { RTCPeerConnection } = require('wrtc')

interface SendCallbackInterface {
    (type: string, message: any): void;
}

interface ErrorCallbackInterface {
    (error: Error, event: Event): void;
}

export class RTCPeer
{
    public iceConfig: any
    public sendCallback: SendCallbackInterface
    public errorCallback: ErrorCallbackInterface =
        (error, event) => console.error(error, event)
    
    public conn: RTCPeerConnection | null = null
    
    
    constructor(iceConfig: any, sendCallback: SendCallbackInterface)
    {
        if (iceConfig === undefined)
            this.iceConfig = defaultIceConfig;
        else
            this.iceConfig = iceConfig
        
        this.sendCallback = sendCallback
    }
    
    open()
    {
        if (this.conn !== null) return;
        this.conn = new RTCPeerConnection(this.iceConfig);
        if (this.conn === null) return;
        this.conn.addEventListener('negotiationneeded', (event) => 
        {
            try{this.sendOffer()}
            catch(error){this.errorCallback(error,event)}
        })
        this.conn.addEventListener('icecandidate', (event) =>
        {
            try{this.handleCandidateEvent(event)}
            catch(error){this.errorCallback(error,event)}
        });
    }
    
    close()
    {
        if (this.conn === null) return;
        try{this.conn.close()}
        catch(e){}
        this.conn = null
    }
    
    async sendOffer() // private
    {
        if (this.conn === null) return;
        const offer = await this.conn.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        await this.conn.setLocalDescription(offer);
        this.sendCallback('offer', offer)
    }
    
    async acceptOffer(offer : RTCSessionDescription)
    {
        if (this.conn === null) return;
        await this.conn.setRemoteDescription(offer);
        const answer = await this.conn.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        await this.conn.setLocalDescription(answer);
        this.sendCallback('answer', answer)
    }
    
    async acceptAnswer(answer : RTCSessionDescription)
    {
        if (this.conn === null) return;
        await this.conn.setRemoteDescription(answer)
    }
    
    handleCandidateEvent(event: RTCPeerConnectionIceEvent) // private
    {
        if (event.candidate && event.candidate.candidate)
            this.sendCallback('candidate', event.candidate)
    }
    
    addCandidate(candidate: RTCIceCandidate)
    {
        if (this.conn === null) return;
        this.conn.addIceCandidate(candidate);
    }
}

export const defaultStunServers = [{
    urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
        //    "stun:stun2.l.google.com:19302",
        //    "stun:stun3.l.google.com:19302",
        //    "stun:stun4.l.google.com:19302"
    ]
}]

export const defaultIceConfig = {
    iceServers: defaultStunServers
}
