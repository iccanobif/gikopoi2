const mimeType = 'video/webm; codecs="vorbis,vp8"'

export default class VideoChunkPlayer
{
    constructor(container)
    {
        this.container = container
        this.videoElement = document.createElement("video")

        this.videoElement.autoplay = true
        container.appendChild(this.videoElement)

        this.mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(this.mediaSource);

        this.queue = []

        this.mediaSource.addEventListener("sourceopen", (e) =>
        {
            console.log("sourceopen", e)
            this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);

            // this.sourceBuffer.addEventListener('abort', console.warn)
            // this.sourceBuffer.addEventListener('error', console.warn)
            // this.sourceBuffer.addEventListener('update', console.warn)
            // this.sourceBuffer.addEventListener('updateend', console.warn)
            // this.sourceBuffer.addEventListener('updatestart', console.warn)

            this.sourceBuffer.addEventListener('updateend', () =>
            {
                console.log("updateend", this.queue)
                if (this.queue.length)
                {
                    this.sourceBuffer.appendBuffer(this.queue.shift())
                    this.videoElement.play().catch(console.error)
                }
            }, false);
        }, false)
    }

    playChunk(arrayBuffer)
    {
        console.log("playing chunk", this.mediaSource.readyState, this.sourceBuffer.updating, this.queue)
        if (this.mediaSource.readyState != "open")
            return
        if (!this.queue.length && !this.sourceBuffer.updating)
        {
            console.log("appending buffer")
            this.sourceBuffer.appendBuffer(arrayBuffer);
            this.videoElement.play().catch(console.error)
        }
        else
            this.queue.push(arrayBuffer)
    }
}
