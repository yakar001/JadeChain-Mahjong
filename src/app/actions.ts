
'use server';

import { suggestMove, SuggestMoveInput, SuggestMoveOutput } from '@/ai/flows/suggest-move';
import { textToSpeech, TextToSpeechOutput } from '@/ai/flows/text-to-speech';


export async function getAiSuggestion(input: SuggestMoveInput): Promise<SuggestMoveOutput> {
  return suggestMove(input);
}

export async function getSpeech(text: string): Promise<TextToSpeechOutput> {
    return textToSpeech(text);
}
