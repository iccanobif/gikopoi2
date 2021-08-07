declare global {
    interface Window {
         EXPECTED_SERVER_VERSION: number; 
         USER_COUNT_GEN: number;
         STREAMER_COUNT_GEN: number;
         USER_COUNT_FOR: number;
         STREAMER_COUNT_FOR: number;
    }
    interface MediaDevices {
        getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
      }
    
      // if constraints config still lose some prop, you can define it by yourself also
      interface MediaTrackConstraintSet {
        displaySurface?: ConstrainDOMString;
        logicalSurface?: ConstrainBoolean;
        // more....
      }
}

import { Room } from "./backend/types";

export const BLOCK_WIDTH = 80
export const BLOCK_HEIGHT = 40

export const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi

export function loadImage(url: string): Promise<HTMLImageElement>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const img = new Image();
            img.addEventListener("load", () => 
            {
                resolve(img)
            })
            img.addEventListener("error", reject)

            img.src = url + "?v=" + window.EXPECTED_SERVER_VERSION;
        }
        catch (err)
        {
            reject(err)
        }
    })
}

// returns "left" and "bottom" positions
export function calculateRealCoordinates(room: Room, x: number, y: number)
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

export function postJson(url: string, data: any)
{
    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export function logToServer(msg: string)
{
    return fetch("/error", {
        method: "POST",
        headers: { 'Content-Type': "text/plain"},
        body: msg
    })
}

// Some websites don't seem to realize that URL encoded strings should decode to UTF-8 and not to SHIFT-JIS.
// example: https://seesaawiki.jp/your_heart/d/%A4%C8%A4%AD%A4%E1%A4%AD%A5%BB%A5%F3%A5%B5%A1%BC%A4%CB%A4%C4%A4%A4%A4%C6
export function safeDecodeURI(str: string)
{
    try {
        return decodeURI(str)
    }
    catch (exc)
    {
        return str
    }
}

export const debounceWithDelayedExecution = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
  
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

export const debounceWithImmediateExecution = (func: (...args: any[]) => void, wait: number) => {
    let lastExecution: number;
  
    return function executedFunction(...args: any[]) {
      if (Date.now() - lastExecution > wait)
      {
        lastExecution = Date.now()
        func(...args);
      }
    };
  };

export const canUseAudioContext = !!window.AudioContext
// export const canUseAudioContext = false
const maxGain = 1.3

export class AudioProcessor
{
    stream: MediaStream
    videoElement: HTMLVideoElement
    volume: number
    isBoostEnabled = false

    context: AudioContext | null = null
    source: MediaStreamAudioSourceNode | null = null
    compressor: DynamicsCompressorNode | null = null
    gain: GainNode | null = null

    constructor(stream: MediaStream, videoElement: HTMLVideoElement, volume: number)
    {
        this.stream = stream
        
        this.videoElement = videoElement
        this.volume = volume
        videoElement.volume = volume

        if (canUseAudioContext)
        {
            this.context = new AudioContext()
            this.source = this.context.createMediaStreamSource(stream);
            this.compressor = this.context.createDynamicsCompressor();
            this.compressor.threshold.value = -50;
            this.compressor.knee.value = 40;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0;
            this.compressor.release.value = 0.25;
            this.gain = this.context.createGain()
            this.gain.gain.value = maxGain
        }
    }

    dispose()
    {
        if (canUseAudioContext && this.context)
            this.context.close().catch(console.error)
    }

    setVolume(volume: number)
    {
        this.volume = volume
        if (!this.isBoostEnabled)
            this.videoElement.volume = volume

        if (canUseAudioContext && this.gain)
            this.gain.gain.value = volume * maxGain
    }

    enableCompression()
    {
        if (!canUseAudioContext
            // these checks are here only to make typescript happy...
            || !this.source 
            || !this.compressor
            || !this.gain
            || !this.context ) return 

        this.source.connect(this.compressor)
        this.compressor.connect(this.gain)
        this.gain.connect(this.context.destination)

        this.videoElement.volume = 0
        this.isBoostEnabled = true
    }
    
    disableCompression()
    {
        if (!canUseAudioContext
            // these checks are here only to make typescript happy...
            || !this.source 
            || !this.compressor
            || !this.gain ) return 

        this.source.disconnect()
        this.compressor.disconnect()
        this.gain.disconnect()

        this.videoElement.volume = this.volume
        this.isBoostEnabled = false
    }
}

export function getFormattedCurrentDate() {
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
export function requestNotificationPermission()
{
    return new Promise((resolve, reject) => {
        const promise = Notification.requestPermission(resolve)
        if (promise)
            promise.then(resolve)
    })
}

// TODO test if this UserException actually works
export class UserException extends Error {
    constructor(message: string)
    {
        super(message)
    }
}

export function isRunningOnWebpackServer()
{
    return "webpackHotUpdate" in window
}
