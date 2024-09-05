import type { ClientRoom, ImageLayer, DeviceInfo } from './types'

export const BLOCK_WIDTH = 80
export const BLOCK_HEIGHT = 40

export const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi

export function loadImage(url: string): Promise<HTMLImageElement>
{
    return new Promise<HTMLImageElement>((resolve, reject) =>
    {
        try
        {
            const img = new Image();
            img.addEventListener("load", () => 
            {
                resolve(img)
            })
            img.addEventListener("error", reject)
            img.src = url + "?v=" + window.EXPECTED_SERVER_VERSION
        }
        catch (err)
        {
            reject(err)
        }
    })
}

export function stringToImage(imageString: string, isPng: boolean): Promise<HTMLImageElement>
{
    return new Promise<HTMLImageElement>((resolve, reject) => {
        try
        {
            const img = new Image()
            
            if (isPng)
               img.src = "data:image/png;base64," + imageString
            else
                img.src = "data:image/svg+xml;base64," + btoa(imageString)
            
            img.addEventListener("load", () => resolve(img))
            img.addEventListener("error", reject)
        }
        catch (exc)
        {
            reject(exc)
        }
    })
}

export async function stringToImageList(imageString: string, isBase64: boolean)
{
    if (isBase64)
    {
        const img = await stringToImage(imageString, true);
        const imageLayers: ImageLayer[] = [{ image: img }]
        return Promise.resolve(imageLayers)
    }

    return new Promise<ImageLayer[]>((resolve, reject) =>
    {
        try
        {
            const svgDoc = document.createElement("template")
            svgDoc.innerHTML = imageString
            
            if (!svgDoc.content || !svgDoc.content.firstElementChild)
                return
            
            const elements = Array.from(svgDoc.content.firstElementChild.children)
                .filter(el => el.tagName != "defs") as SVGElement[]
            
            Promise.all(elements
                .reduce((acc, el) =>
            {
                const object = (el.firstElementChild
                        && el.firstElementChild.tagName == "desc"
                        && el.firstElementChild.textContent
                        && el.firstElementChild.textContent.charAt(0) == "{")
                    ? JSON.parse(el.firstElementChild.textContent)
                    : {}
                if (el.id && el.id.startsWith("gikopoipoi_"))
                {
                    if (!object.tags) object.tags = []
                    object.tags.push(el.id.slice(11))
                }
                const lastIndex = acc.length - 1
                const isCurrentObjectUsed = Object.keys(object).length > 0
                const isLastObjectUsed = acc[lastIndex] && Object.keys(acc[lastIndex][0]).length > 0
                if (acc.length == 0 || isCurrentObjectUsed || isLastObjectUsed)
                    acc.push([object, [el]])
                else
                    acc[lastIndex][1].push(el)
                return acc
            }, [] as [ImageLayer, Element[]][])
                .map(async ([object, layerEls]) =>
            {
                elements.forEach(el => { el.style.display = layerEls.includes(el) ? "inline" : "none" })
                if (!svgDoc.content.firstElementChild) return object
                const img = await stringToImage(svgDoc.content.firstElementChild.outerHTML, false);
                object.image = img;
                return object;
            }))
                .then(images => { resolve(images) })
                .catch(reject)
        }
        catch (exception)
        {
            reject(exception)
        }
    })
}

// returns "left" and "bottom" positions
export function calculateRealCoordinates(room: ClientRoom, x: number, y: number): {x: number, y: number}
{
    const blockWidth = room.blockWidth ? room.blockWidth : BLOCK_WIDTH;
    const blockHeight = room.blockHeight ? room.blockHeight : BLOCK_HEIGHT;
    
    let realX = room.originCoordinates.x
        + x * blockWidth / 2
        + y * blockWidth / 2

    let realY = room.originCoordinates.y
        + x * blockHeight / 2
        - y * blockHeight / 2

    return { x: realX, y: realY }
}

export const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export function postJson(url: string, data: any): Promise<Response>
{
    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export function logToServer(msg: string): Promise<Response>
{
    return fetch("/api/client-log", {
        method: "POST",
        headers: { 'Content-Type': "text/plain"},
        body: msg
    })
}


// Some websites don't seem to realize that URL encoded strings should decode to UTF-8 and not to SHIFT-JIS.
// example: https://seesaawiki.jp/your_heart/d/%A4%C8%A4%AD%A4%E1%A4%AD%A5%BB%A5%F3%A5%B5%A1%BC%A4%CB%A4%C4%A4%A4%A4%C6
export function safeDecodeURI(str: string): string
{
    try {
        return decodeURI(str)
    }
    catch (exc)
    {
        return str
    }
}

export const debounceWithDelayedExecution = (func: any, wait: number): ((...args: any) => void) => {
    let timeout: number;
  
    return function executedFunction(...args) {
      const later = () => {
        window.clearTimeout(timeout);
        func(...args);
      };
  
      window.clearTimeout(timeout);
      timeout = window.setTimeout(later, wait);
    };
  };

export const debounceWithImmediateExecution = (func: any, wait: number) => {
    let lastExecution: number | null = null;
  
    return function executedFunction(...args: any) {
      if (Date.now() - (lastExecution || 0) > wait)
      {
        lastExecution = Date.now()
        func(...args);
      }
    };
  };

var AudioContext = window.AudioContext          // Default
                 || (window as any).webkitAudioContext;  // Safari and old versions of Chrome

export type VuMeterCallback = (level: number) => void

export class AudioProcessor
{
    private stream: MediaStream
    private volume: number = 0
    private gainValue: number = 0
    private isInbound: boolean
    public isMute: boolean = false // used in the html template
    
    public isBoostEnabled: boolean = false // set by v-model
    
    private context: AudioContext
    private source: MediaStreamAudioSourceNode
    public destination: MediaStreamAudioDestinationNode
    private compressor: DynamicsCompressorNode
    private gain: GainNode
    private pan: StereoPannerNode | GainNode
    private analyser: AnalyserNode
    
    private vuMeterTimer: number
    
    constructor(stream: MediaStream, volume: number, isInbound: boolean, vuMeterCallback: VuMeterCallback)
    {
        this.stream = stream
        this.isInbound = isInbound

        this.context = new AudioContext();
        this.source = this.context.createMediaStreamSource(stream);
        this.destination = this.context.createMediaStreamDestination()
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;
        this.gain = this.context.createGain();

        // To support old safari versions that people still seem to use, check that createStereoPanner
        // is available, and if not, use a dummy gain node instead.
        if (this.context.createStereoPanner)
        {
            this.pan = this.context.createStereoPanner();
            this.pan.pan.value = 0
        }
        else
        {
            this.pan = this.context.createGain();
        }

        this.analyser = this.context.createAnalyser()

        this.connectNodes()

        this.setVolume(volume)

        // Vu meter
        this.analyser.minDecibels = -60;
        this.analyser.maxDecibels = 0;
        this.analyser.smoothingTimeConstant = 0.01;
        // fftSize must be 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, or 32768
        this.analyser.fftSize = 32
        const bufferLengthAlt = this.analyser.frequencyBinCount;
        const dataArrayAlt = new Uint8Array(bufferLengthAlt);

        this.vuMeterTimer = window.setInterval(() => {
            try {
                this.analyser.getByteFrequencyData(dataArrayAlt)

                const max = dataArrayAlt.reduce((acc, val) => Math.max(acc, val))

                // Convert level to a linear scale between 0 and 1
                const linearLevel = max / 255

                // Convert level to a logarithmic scale between 0 and 1
                const sensitivity = 50
                const logarithmicLevel = Math.log(linearLevel * sensitivity + 1) / Math.log(sensitivity + 1)

                vuMeterCallback(logarithmicLevel)
            }
            catch (exc)
            {
                console.error(exc)
                window.clearInterval(this.vuMeterTimer)
            }
        }, 100)
    }

    async dispose(): Promise<void>
    {
        for (const track of this.stream.getTracks()) track.stop();
        window.clearInterval(this.vuMeterTimer)
        try {
            return await this.context.close()
        } catch (message) {
            return console.error(message)
        }
    }

    connectNodes()
    {
        this.source.disconnect()
        this.compressor.disconnect()
        this.gain.disconnect()
        this.pan.disconnect()

        if (this.isBoostEnabled)
        {
            this.source.connect(this.compressor)
            this.compressor.connect(this.gain)
        }
        else
        {
            this.source.connect(this.gain)
        }

        this.gain.connect(this.pan)

        if (this.isInbound)
            this.pan.connect(this.context.destination)
        
        this.pan.connect(this.destination)
        this.pan.connect(this.analyser)
    }

    updateGainNodeGain()
    {
        if (this.isMute)
        {
            this.gain.gain.value = 0
        }
        else 
        {
            const adjustedGain = this.gainValue * 0.25
            
            this.gain.gain.value = this.isBoostEnabled
                ? this.volume * 1.3 + adjustedGain
                : this.volume + adjustedGain
        }
    }

    setVolume(volume: number)
    {
        // Coerce "volume" to number, since in some case it's populated with a value that's
        // read from the local storage and because of previous bugs it might be a string.
        this.volume = +volume 
        this.updateGainNodeGain()
    }

    setGain(gain: number)
    {
        this.gainValue = gain
        this.updateGainNodeGain()
    }

    mute()
    {
        this.isMute = true
        this.updateGainNodeGain()
    }

    unmute()
    {
        this.isMute = false
        this.updateGainNodeGain()
    }

    setPan(value: number)
    {
        // Check that this is actually a pan node and not a dummy gain node (see comments in constructor)
        if ("pan" in this.pan)
            this.pan.pan.value = value
    }

    onCompressionChanged()
    {
        this.connectNodes()
    }
}

export function getFormattedCurrentDate(): string {
    const date = new Date()
    return [date.getFullYear(),
            "-",
            (date.getMonth() + 1).toString().padStart(2, '0'),
            "-",
            date.getDate().toString().padStart(2, '0'),
            " ",
            date.getHours().toString().padStart(2, '0'),
            ":",
            date.getMinutes().toString().padStart(2, '0'),
            ":",
            date.getSeconds().toString().padStart(2, '0'),
           ].join('');
  };

// On normal god-fearing browsers requestPermission() returns a Promise, while
// safari uses a callback parameter.
export function requestNotificationPermission(): Promise<NotificationPermission>
{
    return new Promise((resolve, reject) => {
        const promise = Notification.requestPermission(resolve)
        if (promise)
            promise.then(resolve)
    })
}

export async function getDeviceList(includeAudioDevices: boolean, includeVideoDevices: boolean): Promise<DeviceInfo[]>
{
    if (!includeVideoDevices && !includeAudioDevices)
        return []

    // In order to get the labels, we need to get permission first 
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: includeVideoDevices, audio: includeAudioDevices })

    const devices = await navigator.mediaDevices.enumerateDevices();

    const output = devices
        .filter(d => (includeAudioDevices && d.kind == "audioinput") || (includeVideoDevices && d.kind == "videoinput"))
        .map(d => ({
            id: d.deviceId,
            name: d.label,
            type: d.kind
        }))

    for (const track of mediaStream.getTracks()) track.stop();

    return output
}

export function getClickCoordinatesWithinCanvas(canvas: HTMLCanvasElement, clickEvent: MouseEvent, devicePixelRatio: number)
{
    const canvasBoundingClientRect = canvas.getBoundingClientRect()
    
    return {
        x: (clickEvent.clientX - canvasBoundingClientRect.x) * devicePixelRatio,
        y: (clickEvent.clientY - canvasBoundingClientRect.y) * devicePixelRatio,
    }
}

// HTML control functions

export const controlCharLT = String.fromCharCode(2) // <
export const controlCharGT = String.fromCharCode(3) // >
export const controlCharAmp = String.fromCharCode(31) // &

export function htmlToControlChars(str: string): string
{
    return str
        .replaceAll("&", controlCharAmp)
        .replaceAll("<", controlCharLT)
        .replaceAll(">", controlCharGT)
}

export function controlCharsToHtml(str: string): string
{
    return str
        .replaceAll(controlCharAmp, "&")
        .replaceAll(controlCharLT, "<")
        .replaceAll(controlCharGT, ">")
}

export function removeControlChars(str: string): string
{
    return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
}

export function escapeHTML(str: string): string
{
    return str
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}
