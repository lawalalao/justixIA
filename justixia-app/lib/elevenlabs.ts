import { env } from './env';

const ELEVEN_BASE = 'https://api.elevenlabs.io/v1';

// Voices: tu remplaceras les IDs par les voix choisies dans le dashboard ElevenLabs.
export const VOICES = {
  client_default: 'pMsXgVXv3BLzUgSXRplE',     // serveur — voix neutre
  client_emotional: 'AZnzlk1XvdvUeBnXmlld',   // voix plus émotionnelle (cas familial)
  judge: 'TxGEqnHWrfWFTfGW9XjX',              // voix grave, autoritaire
  opposing_counsel: 'XB0fDUnXU5powFXDhCwa',   // voix masculine pro
  senior_grader: 'EXAVITQu4vr4xnSDxMaL',      // voix calme, posée
} as const;

export type VoiceKey = keyof typeof VOICES;

export async function tts(text: string, voiceKey: VoiceKey): Promise<ArrayBuffer> {
  const voiceId = VOICES[voiceKey];
  const res = await fetch(`${ELEVEN_BASE}/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.elevenlabsKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return res.arrayBuffer();
}
