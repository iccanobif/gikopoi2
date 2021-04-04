import { urlRegex } from "./utils.js";

function isJapanese(text)
{
    // very simple heuristic, we just assume that if a sentence has at least one japanese character, then it must be japanese
    for (let i = 0; i < text.length; i++)
    {
        const charCode = text.charCodeAt(i)
        // CJK Unified Ideographs 
        if (charCode >= 0x4E00 && charCode <= 0x9FFF) 
            return true
        // hiragana + katakana
        if (charCode >= 0x3040 && charCode <= 0x30FF) 
            return true
    }
}

const sillyVowels = {
    a: new Audio("silly-tts/a.wav"),
    e: new Audio("silly-tts/e.wav"),
    i: new Audio("silly-tts/i.wav"),
    o: new Audio("silly-tts/o.wav"),
    u: new Audio("silly-tts/u.wav"),
}

function playSillyVowel(vowel)
{
    return new Promise((resolve) => {
        const listener = sillyVowels[vowel].addEventListener("ended", () => 
        {
            sillyVowels[vowel].removeEventListener("ended", listener);
            resolve()
        })
        sillyVowels[vowel].play()
    })
}

export async function speak(message, voiceURI, volume, pitch)
{
    if (volume == 0)
        return

    const cleanMsgForSpeech = message
        .replace(urlRegex, "URL")
        .replace(/ww+/gi, "わらわら")
        .replace(/88+/gi, "ぱちぱち")
        
    const allVoices = speechSynthesis.getVoices()

    if (voiceURI == "silly-voice" || allVoices.length == 0)
    {
        const vowels = cleanMsgForSpeech.match(/[aeiou]/gi) || []
        sillyVowels.a.volume = volume / 100
        sillyVowels.e.volume = volume / 100
        sillyVowels.i.volume = volume / 100
        sillyVowels.o.volume = volume / 100
        sillyVowels.u.volume = volume / 100
        for (const vowel of vowels)
            await playSillyVowel(vowel)
    }
    else 
    {
        const utterance = new SpeechSynthesisUtterance(cleanMsgForSpeech)

        utterance.volume = volume / 100

        if (pitch !== undefined && pitch !== null)
            utterance.pitch = pitch // range between 0 (lowest) and 2 (highest), with 1 being the default pitch 

        if (voiceURI == "automatic")
        {
            utterance.lang = isJapanese(message) ? "ja" : "en"
        }
        else
        {
            const voice = allVoices.find(v => v.voiceURI == voiceURI)
            if (voice) utterance.voice = voice
        }
        
        speechSynthesis.speak(utterance)
    }
}