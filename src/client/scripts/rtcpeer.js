export class RTCPeer
{
    constructor(iceConfig, sendCallback)
    {
		if (iceConfig === undefined)
			this.iceConfig = defaultIceConfig;
		else
			this.iceConfig = iceConfig
        
        this.sendCallback = sendCallback
        this.errorCallback = (error, event) => console.error(error, event)
        
        this._offer = null
        
        this.conn = null
    }
    
    open()
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
            try{this.handleCandidateEvent(event)}
            catch(error){this.errorCallback(error,event)}
        });
    }
    
    close()
    {
        if (this.conn === null) return;
        this.conn.close()
        this.conn = null
    }
    
    async sendOffer() // private
    {
        if (this.conn === null) return;
        const offer = await this.conn.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        this._offer = offer.sdp
        this.sendCallback('offer', offer.sdp)
    }
    
    async acceptOffer(offer) // : RTCSessionDescription
    {
        if (this.conn === null) return;
        await this.conn.setRemoteDescription(
            new RTCSessionDescription({type: 'offer', sdp: offer}));
        const answer = await this.conn.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        })
        await this.conn.setLocalDescription(answer);
        this.sendCallback('answer', answer.sdp)
    }
    
    async acceptAnswer(answer) // : RTCSessionDescription
    {
        if (this.conn === null) return;
        if (this._offer !== null)
        {
            await this.conn.setLocalDescription(
                new RTCSessionDescription({type: 'offer', sdp: this._offer}));
            this._offer = null;
        }
        await this.conn.setRemoteDescription(
            new RTCSessionDescription({type: 'answer', sdp: answer}))
    }
    
    handleCandidateEvent(event) // private
    {
        if (event.candidate)
            this.sendCallback('candidate', event.candidate)
    }
    
    addCandidate(candidate) // : RTCIceCandidate
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
