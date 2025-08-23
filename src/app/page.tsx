
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Feather, Sword, Crown, Diamond, Calendar, Clock, BarChart, Star } from "lucide-react";
import type { ReactElement } from "react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

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

const rankTiers = [
    { name: "青铜 (Bronze)", color: "text-amber-700" },
    { name: "白银 (Silver)", color: "text-gray-400" },
    { name: "黄金 (Gold)", color: "text-yellow-500" },
    { name: "铂金 (Platinum)", color: "text-cyan-400" },
    { name: "钻石 (Diamond)", color: "text-violet-400" },
    { name: "雀圣 (Mahjong Saint)", color: "text-red-500" },
];

const tournaments = [
  {
    name: "泉金杯周赛 #23",
    status: "报名中",
    prizePool: 100000,
    entryFee: 500,
    players: 88,
    maxPlayers: 128,
    startTime: "今天 20:00",
    statusColor: "bg-green-500",
  },
  {
    name: "金龙争霸赛",
    status: "进行中",
    prizePool: 500000,
    entryFee: 2000,
    players: 64,
    maxPlayers: 64,
    startTime: "已开始",
    statusColor: "bg-blue-500",
  },
    {
    name: "新手选拔赛",
    status: "已结束",
    prizePool: 10000,
    entryFee: 100,
    players: 256,
    maxPlayers: 256,
    startTime: "昨天 18:00",
    statusColor: "bg-gray-500",
  }
];

export default function Home() {
  const { toast } = useToast();

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">游戏大厅 (Game Lobby)</h1>
      <Tabs defaultValue="standard">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="standard">标准场 (Standard)</TabsTrigger>
          <TabsTrigger value="ranked">排位赛 (Ranked)</TabsTrigger>
          <TabsTrigger value="tournament">锦标赛 (Tournament)</TabsTrigger>
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
                  <Button className="w-full" asChild>
                    <Link href="/game">
                      加入对局 (Join Game)
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ranked" className="mt-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>S1: 潜龙赛季 (Season of the Hidden Dragon)</span>
                             <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar size={14} />
                                25天后结束
                            </Badge>
                        </CardTitle>
                        <CardDescription>参与排位对局，提升段位，赢取赛季专属奖励。</CardDescription>
                    </CardHeader>
                     <CardContent>
                       <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-accent/50 rounded-lg">
                           <div className="flex-shrink-0">
                                <Star className="w-20 h-20 text-yellow-500" fill="currentColor"/>
                           </div>
                           <div className="flex-grow w-full">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-xl font-bold text-yellow-500">黄金 III (Gold III)</h3>
                                    <p className="font-semibold">1,250 / 1,500 RP</p>
                                </div>
                               <Progress value={(1250/1500)*100} className="h-3"/>
                               <p className="text-xs text-muted-foreground mt-1 text-right">还差 250 RP 即可晋级 黄金 II</p>
                           </div>
                       </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full sm:w-auto ml-auto" onClick={() => toast({ title: "开始匹配排位赛", description: "正在为您寻找旗鼓相当的对手..." })}>
                            <Sword className="mr-2" />
                            开始排位赛 (Start Ranked Match)
                        </Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy /> 赛季奖励 (Season Rewards)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="flex flex-col items-center gap-2 p-2 border rounded-md bg-accent/50">
                             <p className="text-sm font-bold text-yellow-500">黄金</p>
                             <Image src="https://placehold.co/200x200.png" data-ai-hint="gold glowing lines" alt="Gold Reward" width={80} height={80} className="rounded" />
                             <p className="text-xs text-muted-foreground">金脉碎片 x10</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 border rounded-md bg-accent/50">
                             <p className="text-sm font-bold text-cyan-400">铂金</p>
                             <Image src="https://placehold.co/200x200.png" data-ai-hint="glowing platinum chest" alt="Platinum Reward" width={80} height={80} className="rounded" />
                             <p className="text-xs text-muted-foreground">赛季限定头像框</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-2 border rounded-md bg-accent/50">
                             <p className="text-sm font-bold text-violet-400">钻石</p>
                             <Image src="https://placehold.co/200x200.png" data-ai-hint="glowing diamond key" alt="Diamond Reward" width={80} height={80} className="rounded" />
                             <p className="text-xs text-muted-foreground">限量版 金鼎 NFT</p>
                        </div>
                         <div className="flex flex-col items-center gap-2 p-2 border rounded-md bg-accent/50">
                             <p className="text-sm font-bold text-red-500">雀圣</p>
                             <Image src="https://placehold.co/200x200.png" data-ai-hint="glowing dragon avatar" alt="Saint Reward" width={80} height={80} className="rounded" />
                             <p className="text-xs text-muted-foreground">专属动态头像</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2"><BarChart /> 段位列表 (Rank Tiers)</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-4">
                           {rankTiers.map(tier => (
                               <li key={tier.name} className="flex items-center gap-3">
                                   <Star className={`w-6 h-6 flex-shrink-0 ${tier.color}`} fill="currentColor" />
                                   <span className="font-semibold">{tier.name}</span>
                               </li>
                           ))}
                       </ul>
                    </CardContent>
                </Card>
            </div>
           </div>
        </TabsContent>
        <TabsContent value="tournament" className="mt-6">
          <div className="space-y-6">
            {tournaments.map((t, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle>{t.name}</CardTitle>
                    <Badge className={t.statusColor}>{t.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
                  <div>
                    <p className="text-sm text-muted-foreground">总奖池</p>
                    <p className="text-lg font-bold text-primary flex items-center justify-center sm:justify-start gap-1"><Trophy size={16} /> {t.prizePool.toLocaleString()} $JIN</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">报名费</p>
                    <p className="text-lg font-bold">{t.entryFee.toLocaleString()} $JIN</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">参赛人数</p>
                    <p className="text-lg font-bold flex items-center justify-center sm:justify-start gap-1"><Users size={16} /> {t.players}/{t.maxPlayers}</p>
                  </div>
                   <div>
                    <p className="text-sm text-muted-foreground">开始时间</p>
                    <p className="text-lg font-bold flex items-center justify-center sm:justify-start gap-1"><Clock size={16} /> {t.startTime}</p>
                  </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                  <Button 
                    disabled={t.status !== '报名中'}
                    onClick={() => toast({ title: "报名成功!", description: `您已成功报名 ${t.name}。`})}
                  >
                    {t.status === '报名中' ? '报名参赛 (Register)' : t.status === '进行中' ? '查看对局 (View Match)' : '查看结果 (View Results)'}
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
