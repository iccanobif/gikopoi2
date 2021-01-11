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
        await this.conn.setLocalDescription(offer);
        this.sendCallback('offer', offer)
    }
    
    async acceptOffer(offer) // : RTCSessionDescription
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
    
    async acceptAnswer(answer) // : RTCSessionDescription
    {
        if (this.conn === null) return;
        await this.conn.setRemoteDescription(answer)
    }
    
    handleCandidateEvent(event) // private
    {
        if (event.candidate && event.candidate.candidate)
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
