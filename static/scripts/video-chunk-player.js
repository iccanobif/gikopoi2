const mimeType = 'video/webm; codecs="vorbis,vp8"'

export default class VideoChunkPlayer
{
    constructor(container)
    {
        this.isPlaying = false
        
        this.videoElement = document.createElement("video")
        container.appendChild(this.videoElement)
        
        this.videoElement.autoplay = true
        
        this.mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(this.mediaSource);
        
        this.queue = []

        this.mediaSource.addEventListener("sourceopen", (e) =>
        {
            this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
            this.sourceBuffer.addEventListener('updateend', () =>
            {
                this.playFromQueue()
            });
        })
    }
    
    playFromQueue()
    {
        if (!this.queue.length)
        {
            this.isPlaying = false
            return
        }
        this.isPlaying = true
        this.sourceBuffer.appendBuffer(this.queue.shift())
        this.videoElement.currentTime = 0;
        this.videoElement.play().catch(console.error)
    }

    playChunk(arrayBuffer)
    {
        if (this.mediaSource.readyState != "open")
            return
        this.queue.push(arrayBuffer)
        if (!this.isPlaying) this.playFromQueue()
    }
}
