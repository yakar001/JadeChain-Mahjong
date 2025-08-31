
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Coins, ShieldCheck, Calendar, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const tournaments = {
  daily: [
    { id: 'd01', name: '每日冲刺赛', status: 'Registering', fee: 5, prize: 100, players: '12/32', req: '无' },
    { id: 'd02', name: '午间快速赛', status: 'In Progress', fee: 5, prize: 100, players: '32/32', req: '无' },
  ],
  weekly: [
    { id: 'w01', name: '泉金杯周赛 #24', status: 'Registering', fee: 50, prize: 10000, players: '88/128', req: 'KYC Lv.1' },
    { id: 'w02', name: '周末赏金赛', status: 'Finished', fee: 20, prize: 5000, players: '64/64', req: '无' },
  ],
  seasonal: [
     { id: 's01', name: '秋季资格赛', status: 'Upcoming', fee: 200, prize: 50000, players: '0/256', req: 'KYC Lv.2' },
  ],
  annual: [
     { id: 'a01', name: '年度总决赛', status: 'Upcoming', fee: 1000, prize: 1000000, players: '0/64', req: '邀请制' },
  ],
};

const statusConfig = {
    Registering: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "报名中" },
    'In Progress': { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "进行中" },
    Upcoming: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "即将开始" },
    Finished: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "已结束" },
}

const TournamentCard = ({ tournament }: { tournament: (typeof tournaments)['daily'][0] }) => {
    const { toast } = useToast();
    const config = statusConfig[tournament.status as keyof typeof statusConfig];

    const handleRegister = () => {
        toast({
            title: "报名成功 (Registration Successful)",
            description: `您已成功报名参加 ${tournament.name}。`,
        });
    };

    return (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-xl">{tournament.name}</CardTitle>
                    <Badge variant="outline" className={config.color}>{config.label}</Badge>
                </div>
                <CardDescription>ID: {tournament.id}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Coins className="text-primary"/>
                        <div>
                            <p className="text-muted-foreground">奖池</p>
                            <p className="font-bold font-mono">{tournament.prize.toLocaleString()} $JIN</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="text-primary"/>
                        <div>
                            <p className="text-muted-foreground">参赛人数</p>
                            <p className="font-bold font-mono">{tournament.players}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Coins className="text-muted-foreground"/>
                        <div>
                            <p className="text-muted-foreground">报名费</p>
                            <p className="font-bold font-mono">{tournament.fee} $JIN</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="text-muted-foreground"/>
                        <div>
                            <p className="text-muted-foreground">参赛条件</p>
                            <p className="font-bold">{tournament.req}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 {tournament.status === 'Registering' && <Button className="w-full" onClick={handleRegister}>立即报名</Button>}
                 {tournament.status === 'In Progress' && <Button className="w-full" variant="secondary" disabled>查看对局</Button>}
                 {tournament.status === 'Finished' && <Button className="w-full" variant="outline">查看结果</Button>}
                 {tournament.status === 'Upcoming' && <Button className="w-full" variant="outline" disabled>尚未开始</Button>}
            </CardFooter>
        </Card>
    );
};

export default function TournamentsPage() {
    return (
        <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2"><Trophy /> 赛事中心 (Tournaments)</h1>
              <p className="text-muted-foreground mt-2">参与锦标赛，挑战顶尖玩家，赢取丰厚奖池。</p>
            </div>
            <Tabs defaultValue="weekly">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="daily"><Calendar className="mr-2"/>日赛 (Daily)</TabsTrigger>
                    <TabsTrigger value="weekly"><Calendar className="mr-2"/>周赛 (Weekly)</TabsTrigger>
                    <TabsTrigger value="seasonal"><Calendar className="mr-2"/>季赛 (Seasonal)</TabsTrigger>
                    <TabsTrigger value="annual"><Calendar className="mr-2"/>年度赛 (Annual)</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {tournaments.daily.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </div>
                </TabsContent>
                 <TabsContent value="weekly">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {tournaments.weekly.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </div>
                </TabsContent>
                 <TabsContent value="seasonal">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                         {tournaments.seasonal.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </div>
                </TabsContent>
                 <TabsContent value="annual">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                         {tournaments.annual.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
