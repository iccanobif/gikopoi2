export type SendCallback = (type: string, msg: string | RTCIceCandidate) => void
export type ErrorCallback = (error: any, event: any) => void


export const defaultIceConfig: RTCConfiguration = {
    iceServers: [{
        urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302"
        ]
    }]
}

export class RTCPeer
{
    private iceConfig: RTCConfiguration
    private sendCallback: SendCallback
    private errorCallback: ErrorCallback
    
    private conn: RTCPeerConnection | null = null
    private offerSdp: string | null = null
    
    constructor(
        iceConfig: RTCConfiguration,
        sendCallback: SendCallback,
        errorCallback: ErrorCallback = (error, event) => console.error(error, event))
    {
        this.iceConfig = iceConfig
        this.sendCallback = sendCallback
        this.errorCallback = errorCallback
    }
    
    public open()
    {
        if (this.conn !== null) return;
        this.conn = new RTCPeerConnection(this.iceConfig);
        this.conn.addEventListener('negotiationneeded', (event) =>
        {
            try{this.sendOffer()}
            catch(error){this.errorCallback(error,event)}
        })
        this.conn.addEventListener('icecandidate', (event) =>
        {
            try
            {
                if (event.candidate)
                    this.sendCallback('candidate', event.candidate)
            }
            catch(error)
            {
                this.errorCallback(error,event)
            }
        });
    }
    
    public close()
    {
        if (this.conn === null) return;
        this.conn.close()
        this.conn = null
    }
    
    private async sendOffer()
    {
        if (this.conn === null) return;
        const offer = await this.conn.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        if (!offer.sdp) return
        this.offerSdp = offer.sdp
        this.sendCallback('offer', offer.sdp)
    }
    
    public async acceptOffer(offerSdp: string)
    {
        if (this.conn === null) return;
        await this.conn.setRemoteDescription(
            new RTCSessionDescription({type: 'offer', sdp: offerSdp}));
        const answer = await this.conn.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        if (!answer.sdp) return
        await this.conn.setLocalDescription(answer);
        this.sendCallback('answer', answer.sdp)
    }
    
    public async acceptAnswer(answerSdp: string)
    {
        if (this.conn === null) return;
        if (this.offerSdp !== null)
        {
            await this.conn.setLocalDescription(
                new RTCSessionDescription({type: 'offer', sdp: this.offerSdp}));
            this.offerSdp = null;
        }
        await this.conn.setRemoteDescription(
            new RTCSessionDescription({type: 'answer', sdp: answerSdp}))
    }
    
    public addCandidate(candidate: RTCIceCandidate)
    {
        if (this.conn === null) return;
        this.conn.addIceCandidate(candidate);
    }
}
