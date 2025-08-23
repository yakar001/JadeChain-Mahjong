'use client';
import { useState } from 'react';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAiSuggestion } from '@/app/actions';
import type { SuggestMoveOutput } from '@/ai/flows/suggest-move';
import { useToast } from '@/hooks/use-toast';

export function AiTutor() {
  const [suggestion, setSuggestion] = useState<SuggestMoveOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      // Mocked data for the AI function call
      const gameState = 'Middle of the game, 7 tiles left in the wall. Opponent has one meld showing (3, 4, 5 of bamboo).';
      const playerHand = '1,2,3 of bamboo, 4,5,6 of dots, 7,8,9 of characters, pair of West winds, one Green Dragon, one White Dragon.';
      const opponentLastMove = 'Discarded a 2 of dots.';

      const result = await getAiSuggestion({
        gameState,
        playerHand,
        opponentLastMove,
      });
      setSuggestion(result);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a suggestion from the AI Tutor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot className="text-primary" />
          AI Tutor (AI 导师)
        </CardTitle>
        <CardDescription>Feeling stuck? Get a strategic tip. (遇到困难了？获取策略提示。)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Thinking... (思考中...)</p>
          </div>
        )}
        {suggestion && (
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div>
              <h4 className="font-bold flex items-center gap-2 text-accent">
                <Lightbulb />
                Suggested Move (建议的出牌)
              </h4>
              <p className="text-foreground">{suggestion.suggestedMove}</p>
            </div>
            <div>
              <h4 className="font-bold text-accent">Reasoning (原因分析)</h4>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetSuggestion} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Get AI Advice (获取 AI 建议)
        </Button>
      </CardFooter>
    </Card>
  );
}
