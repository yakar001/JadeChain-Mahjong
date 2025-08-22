import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gem, Star, Trophy } from "lucide-react";

const rooms = [
  { tier: "Novice", fee: 10, prize: 38, players: 1234 },
  { tier: "Adept", fee: 50, prize: 190, players: 876 },
  { tier: "Expert", fee: 200, prize: 760, players: 451 },
  { tier: "Master", fee: 1000, prize: 3800, players: 102 },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">Game Lobby</h1>
      <Tabs defaultValue="standard">
        <TabsList className="mb-4">
          <TabsTrigger value="standard">Standard Rooms</TabsTrigger>
          <TabsTrigger value="tournament" disabled>Tournaments (Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="standard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card key={room.tier} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{room.tier} Room</span>
                    <Star className="text-primary" />
                  </CardTitle>
                  <CardDescription>Entry Fee: {room.fee} $JIN</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <div>
                      <p className="font-bold text-lg">{room.prize} $JIN</p>
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                    <Users className="text-accent" />
                    <div>
                      <p className="font-bold text-lg">{room.players}</p>
                      <p className="text-xs text-muted-foreground">Players Online</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Join Match
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
