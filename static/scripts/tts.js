import { urlRegex } from "./utils.js";

const synth = new Animalese('animalese.wav', function() { console.log("test") });

function speakAnimalese(text, pitch) {
  // scale pitch so that it's within the range 0.2 - 2.0
  pitch =  (pitch/2)*1.8+0.2
  var audio = new Audio();
  audio.src = synth.Animalese(text, false, 1).dataURI;
  audio.play();
}

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

export function speak(message, voiceURI, volume, pitch)
{
    if (volume == 0)
        return

    const cleanMsgForSpeech = message
        .replace(urlRegex, "URL")
        .replace(/ww+/gi, "わらわら")
        .replace(/88+/gi, "ぱちぱち")

    if (voiceURI == "animalese")
    {
        speakAnimalese(message)
        return
    }

    const allVoices = speechSynthesis.getVoices()

    if (allVoices.length == 0)
        return

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