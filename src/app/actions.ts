'use server';

import { suggestMove, SuggestMoveInput, SuggestMoveOutput } from '@/ai/flows/suggest-move';

export async function getAiSuggestion(input: SuggestMoveInput): Promise<SuggestMoveOutput> {
  return suggestMove(input);
}
