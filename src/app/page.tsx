import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Feather, Sword, Crown, Diamond, Shield, Award } from "lucide-react";
import type { ReactElement } from "react";

const rooms = [
  { 
    tier: "新手场 (Novice)", 
    fee: 10, 
    prize: 38, 
    players: 1234, 
    icon: <Feather className="text-green-400" />,
    description: "轻松入门，熟悉规则"
  },
  { 
    tier: "进阶场 (Adept)", 
    fee: 50, 
    prize: 190, 
    players: 876,
    icon: <Sword className="text-blue-400" />,
    description: "磨炼技巧，初显锋芒"
   },
  { 
    tier: "高手场 (Expert)", 
    fee: 200, 
    prize: 760, 
    players: 451,
    icon: <Crown className="text-purple-400" />,
    description: "高手过招，一较高下"
  },
  { 
    tier: "大师场 (Master)", 
    fee: 1000, 
    prize: 3800, 
    players: 102,
    icon: <Diamond className="text-yellow-400" />,
    description: "巅峰对决，问鼎雀神"
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">游戏大厅 (Game Lobby)</h1>
      <Tabs defaultValue="standard">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="standard">标准场</TabsTrigger>
          <TabsTrigger value="ranked">排位赛</TabsTrigger>
          <TabsTrigger value="tournament">锦标赛</TabsTrigger>
        </TabsList>
        <TabsContent value="standard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card key={room.tier} className="flex flex-col border-primary/20 hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{room.tier}</span>
                    {room.icon}
                  </CardTitle>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                    <div>
                      <p className="text-xs text-muted-foreground">奖池</p>
                      <p className="font-bold text-lg text-primary flex items-center gap-1"><Trophy size={16} /> {room.prize.toLocaleString()} $JIN</p>
                    </div>
                     <div>
                      <p className="text-xs text-muted-foreground text-right">在线玩家</p>
                      <p className="font-bold text-lg flex items-center gap-1">{room.players.toLocaleString()} <Users size={16} /></p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch">
                   <p className="text-sm text-center text-muted-foreground mb-2">
                    入场费: <span className="font-bold text-primary">{room.fee} $JIN</span>
                  </p>
                  <Button className="w-full">
                    加入对局
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ranked" className="mt-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
             <Shield size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold font-headline">排位赛即将开放</h2>
            <p className="text-muted-foreground mt-2">敬请期待！在这里挑战更高的段位，赢取专属荣誉。
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="tournament" className="mt-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <Award size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold font-headline">锦标赛功能正在开发中</h2>
            <p className="text-muted-foreground mt-2">
              未来将在这里举办大型赛事，争夺丰厚奖金和稀有NFT！
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
