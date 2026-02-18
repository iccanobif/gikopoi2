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
    
    const realX = room.originCoordinates.x
        + x * blockWidth / 2
        + y * blockWidth / 2

    const realY = room.originCoordinates.y
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

export async function logToServer(msg: string)
{
    try {
        await fetch("/api/client-log", {
            method: "POST",
            headers: { 'Content-Type': "text/plain" },
            body: msg
        })
    } catch {
        // Ignore errors to prevent infinite loops and increased CPU usage when the network is down.
        // Nothing particularly important is logged here anyway.
    } 
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounceWithImmediateExecution(func: Function, wait: number) {
    let lastExecution: number | null = null;
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function executedFunction(...args: any[]) {
      if (Date.now() - (lastExecution || 0) > wait)
      {
        lastExecution = Date.now()
        func(...args);
      }
    };
  };

const AudioContext = window.AudioContext          // Default
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
    public isFeedbackEnabled: boolean = false // set by v-model

    public pitchFactor: number = 1
    
    private context: AudioContext
    private source: MediaStreamAudioSourceNode
    public destination: MediaStreamAudioDestinationNode
    private compressor: DynamicsCompressorNode
    private gain: GainNode
    private pan: StereoPannerNode | GainNode
    private analyser: AnalyserNode
    private phaseVocoderNode: AudioWorkletNode | null = null
    private lowPassFilter: BiquadFilterNode
    
    private vuMeterCallback: VuMeterCallback
    private vuMeterTimer: number | null = null
    
    constructor(stream: MediaStream, volume: number, isInbound: boolean, vuMeterCallback: VuMeterCallback)
    {
        this.stream = stream
        this.isInbound = isInbound
        this.volume = volume;
        this.vuMeterCallback = vuMeterCallback

        this.context = new AudioContext();
        this.source = this.context.createMediaStreamSource(this.stream);
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

        this.lowPassFilter = this.context.createBiquadFilter()
        this.lowPassFilter.type = "lowpass"
    }

    async initialize(): Promise<void>
    {
        await this.context.audioWorklet.addModule('scripts/phase-vocoder.min.js');

        this.phaseVocoderNode = new AudioWorkletNode(this.context, 'phase-vocoder-processor');

        let pitchFactorParam = this.phaseVocoderNode.parameters.get('pitchFactor')
        if (pitchFactorParam)
            pitchFactorParam.value = 2;

        this.connectNodes()

        this.setVolume(this.volume)

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

                this.vuMeterCallback(logarithmicLevel)
            }
            catch (exc)
            {
                console.error(exc)
                if (this.vuMeterTimer)
                    window.clearInterval(this.vuMeterTimer)
            }
        }, 100)
    }

    async dispose(): Promise<void>
    {
        for (const track of this.stream.getTracks()) track.stop();
        if (this.vuMeterTimer)
            window.clearInterval(this.vuMeterTimer)
        try {
            return await this.context.close()
        } catch (message) {
            return console.error(message)
        }
    }

    isPitchShiftEnabled = () => this.pitchFactor != 1

    connectNodes()
    {
        this.source.disconnect()
        this.compressor.disconnect()
        this.gain.disconnect()
        this.pan.disconnect()
        this.phaseVocoderNode?.disconnect()
        this.lowPassFilter?.disconnect()

        if (this.isBoostEnabled)
        {
            this.source.connect(this.compressor)
            this.compressor.connect(this.gain)
        }
        else
        {
            this.source.connect(this.gain)
        }

        if (this.isPitchShiftEnabled() && this.phaseVocoderNode) 
        {
            this.gain.connect(this.phaseVocoderNode)
            this.phaseVocoderNode.connect(this.lowPassFilter)
            this.lowPassFilter.connect(this.pan)
        }
        else
        {
            this.gain.connect(this.pan)
        }

        if (this.isInbound || this.isFeedbackEnabled)
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

    setFeedback(feedback: boolean)
    {
        this.isFeedbackEnabled = feedback
        this.connectNodes()
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

    getPitchFactor()
    {
        return this.pitchFactor
    }

    setPitchFactor(value: number) {
        this.pitchFactor = value;
    
        if (!this.phaseVocoderNode) return;
        const pitchFactorParam = this.phaseVocoderNode.parameters.get('pitchFactor');
        if (!pitchFactorParam) return;
    
        pitchFactorParam.value = value;

        // Set low pass filter frequency so that:
        // - if pitch factor is close to 0.5, the low pass filter goes to close to 4000 Hz
        // - if pitch factor is close to 1, the treshold is close to maxFrequency
        // This is to avoid aliasing when pitch shifting. These values were chosen empirically
        // with my own microphone and voice, so they might not be perfect for all cases.
        const maxFrequency = this.context.sampleRate / 2;        
        const frequency = value > 1
                        ? maxFrequency
                        : 4000 + (maxFrequency - 4000) * (value - 0.5) * 2;
        this.lowPassFilter.frequency.value = frequency;
        this.lowPassFilter.frequency.value = 4000;

        this.connectNodes();
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

export const debouncedLogSoundVolume = debounceWithDelayedExecution((myUserID: string, volume: number) => {
    logToServer(myUserID + " SFX volume: " + volume)
}, 150)

// TODO: handle cases where the geometry of the <video> element changes during the stream,
//       can be done with a ResizeObserver, maybe
export function adjustNiconicoMessagesFontSize()
{
    const videoElements = document.getElementsByClassName("video-being-played") as HTMLCollectionOf<HTMLVideoElement>
    for (const videoElement of videoElements)
    {
        const width = (videoElement.videoWidth / videoElement.videoHeight) * videoElement.clientHeight
        const fontsize = Math.round(width / 15)
        const niconicoMessagesContainer = videoElement.parentElement!.getElementsByClassName("nico-nico-messages-container")[0] as HTMLElement
        if (niconicoMessagesContainer)
            niconicoMessagesContainer.style.fontSize = fontsize + "px"
    }
}

export function makeUrlsClickable(html: string): string
{
    return html.replace(urlRegex, (htmlUrl: string, prefix: string) =>
        {
            const anchor = document.createElement('a');
            anchor.target = '_blank';
            anchor.setAttribute('tabindex', '-1');
            anchor.innerHTML = safeDecodeURI(htmlUrl);
            const url = anchor.textContent;
            if (url) anchor.href = (prefix == 'www.' ? 'http://' + url : url);
            anchor.rel = "noopener noreferrer";
            return anchor.outerHTML;
        })
}