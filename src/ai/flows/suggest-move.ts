'use server';

/**
 * @fileOverview An AI agent that suggests a move to the player.
 *
 * - suggestMove - A function that suggests a move.
 * - SuggestMoveInput - The input type for the suggestMove function.
 * - SuggestMoveOutput - The return type for the suggestMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMoveInputSchema = z.object({
  gameState: z.string().describe('The current game state in a string format.'),
  playerHand: z.string().describe('The current hand of the player in a string format.'),
  opponentLastMove: z.string().describe('The opponent last move in a string format.'),
});
export type SuggestMoveInput = z.infer<typeof SuggestMoveInputSchema>;

const SuggestMoveOutputSchema = z.object({
  suggestedMove: z.string().describe('The suggested move to the player.'),
  reasoning: z.string().describe('The reasoning behind the suggested move.'),
});
export type SuggestMoveOutput = z.infer<typeof SuggestMoveOutputSchema>;

export async function suggestMove(input: SuggestMoveInput): Promise<SuggestMoveOutput> {
  return suggestMoveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMovePrompt',
  input: {schema: SuggestMoveInputSchema},
  output: {schema: SuggestMoveOutputSchema},
  prompt: `You are an expert Mahjong tutor, and you are watching a player in a difficult situation.

Given the current game state, the player's hand, and the opponent's last move, suggest a move that the player can make to improve their position.
Explain the reasoning behind your suggestion.

Game State: {{{gameState}}}
Player Hand: {{{playerHand}}}
Opponent's Last Move: {{{opponentLastMove}}}

Suggested Move:`,
});

const suggestMoveFlow = ai.defineFlow(
  {
    name: 'suggestMoveFlow',
    inputSchema: SuggestMoveInputSchema,
    outputSchema: SuggestMoveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
