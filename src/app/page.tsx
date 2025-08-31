
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Feather, Sword, Crown, Diamond, Star, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import type { ReactElement } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/wallet-context";

const userKycLevel = 1; 

const initialRooms = [
  { 
    tier: "Free", 
    tierDisplay: "免费体验娱乐场",
    subTitle: "Free Play",
    fee: 0, 
    prize: 0, 
    players: 4,
    minPlayers: 4,
    icon: <Star className="text-yellow-400" />,
    description: "无需费用，尽情娱乐。体验核心玩法，磨练麻将技巧。",
    kycRequired: 0,
  },
  { 
    tier: "Novice", 
    tierDisplay: "新手场",
    subTitle: "Novice",
    fee: 10, 
    prize: 38, 
    players: 3, 
    minPlayers: 4,
    icon: <Feather className="text-green-400" />,
    description: "轻松入门，熟悉规则。小额入场，赢取您的第一桶金。",
    kycRequired: 0,
  },
  { 
    tier: "Adept", 
    tierDisplay: "进阶场",
    subTitle: "Adept",
    fee: 50, 
    prize: 190, 
    players: 4,
    minPlayers: 4,
    icon: <Sword className="text-blue-400" />,
    description: "磨炼技巧，初显锋芒。挑战更强的对手，赢取更高奖励。",
    kycRequired: 0,
   },
  { 
    tier: "Expert", 
    tierDisplay: "高手场",
    subTitle: "Expert",
    fee: 200, 
    prize: 760, 
    players: 1,
    minPlayers: 4,
    icon: <Crown className="text-purple-400" />,
    description: "高手过招，一较高下。需要通过一级KYC认证方可进入。",
    kycRequired: 1,
  },
  { 
    tier: "Master", 
    tierDisplay: "大师场",
    subTitle: "Master",
    fee: 1000, 
    prize: 3800, 
    players: 4,
    minPlayers: 4,
    icon: <Diamond className="text-yellow-400" />,
    description: "巅峰对决，问鼎雀神。通往传奇的最终战场。",
    kycRequired: 2,
  },
];


const LobbySection = ({ title, description, children, link, linkText }: { title: string, description: string, children: React.ReactNode, link?: string, linkText?: string }) => (
    <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-2xl font-bold font-headline text-primary">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {link && linkText && (
                <Button variant="ghost" asChild>
                    <Link href={link}>{linkText} <ArrowRight className="ml-2" /></Link>
                </Button>
            )}
        </div>
        {children}
    </div>
);


export default function Home() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState(initialRooms);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const router = useRouter();
  const { deductTokens, walletAddress } = useWallet();

  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(currentRooms => 
        currentRooms.map(room => {
          if (room.players < room.minPlayers) {
            const change = Math.random() > 0.6 ? 1 : 0;
            const newPlayers = Math.min(room.players + change, room.minPlayers);
            return { ...room, players: newPlayers };
          }
          if (room.players === room.minPlayers) {
             const change = Math.random() > 0.9 ? -1 : 0;
             const newPlayers = Math.max(0, room.players + change);
             return { ...room, players: newPlayers };
          }
          return room;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async (room: typeof rooms[0]) => {
    if (isJoining) return;

    if (room.fee > 0 && !walletAddress) {
        toast({
            variant: "destructive",
            title: "钱包未连接",
            description: "请先连接您的钱包再加入对局。",
        });
        return;
    }

    if (room.kycRequired > userKycLevel) {
      toast({
        variant: "destructive",
        title: "KYC 等级不足",
        description: `进入 ${room.tierDisplay} 需要 KYC 等级 ${room.kycRequired}。`,
      });
      return;
    }
    
     if (room.players < room.minPlayers) {
      toast({
        title: "正在等待更多玩家",
        description: `房间 ${room.tierDisplay} 需要 ${room.minPlayers} 名玩家才能开始。`,
      });
      return;
    }
    
    setIsJoining(room.tier);

    let paymentSuccess = true;
    if (room.fee > 0) {
        paymentSuccess = await deductTokens(room.fee);
    }

    if (paymentSuccess) {
      router.push(`/game?tier=${room.tier}&fee=${room.fee}`);
    } else {
      setIsJoining(null);
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary tracking-wider">欢迎来到泉金麻将</h1>
        <p className="text-lg text-muted-foreground mt-2">在这里，传统与未来交汇</p>
      </div>
      
      <LobbySection title="自由对局" description="选择您的战场，开始对局">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const isWaiting = room.players < room.minPlayers;
              const isBusy = isJoining === room.tier;

              return (
                <Card key={room.tier} className="flex flex-col border-primary/20 hover:border-primary/50 transition-all duration-300 bg-card/50 hover:bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-headline">{room.tierDisplay}</CardTitle>
                        {room.icon}
                    </div>
                    <CardDescription>{room.subTitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                     <p className="text-sm text-muted-foreground h-10">{room.description}</p>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <div>
                        <p className="text-xs text-muted-foreground">入场费</p>
                        <p className="font-bold text-lg text-primary">{room.fee.toLocaleString()} $JIN</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">在线玩家</p>
                        <p className="font-bold text-lg">{room.players.toLocaleString()} / {room.minPlayers}</p>
                      </div>
                    </div>
                     {room.kycRequired > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
                          <ShieldCheck size={16} />
                          <span>需要 KYC 等级 {room.kycRequired}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinRoom(room)} 
                      disabled={isBusy || isWaiting}
                    >
                      {isBusy ? <Loader2 className="animate-spin" /> : isWaiting ? "等待玩家..." : "加入对局"}
                    </Button>
                  </CardFooter>
                </Card>
            )})}
          </div>
      </LobbySection>

       <LobbySection title="赛事中心" description="参与锦标赛，赢取巨额奖池" link="/tournaments" linkText="查看所有赛事">
            <Card className="p-6 bg-gradient-to-br from-primary/20 to-card">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                         <p className="text-sm text-muted-foreground">即将开始</p>
                         <h3 className="text-2xl font-bold font-headline">泉金杯周赛 #24</h3>
                         <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-lg">
                             <div className="flex items-center gap-2"><Trophy /> 100,000 $JIN</div>
                             <div className="flex items-center gap-2"><Users /> 88/128</div>
                         </div>
                    </div>
                    <Button size="lg" className="bg-primary/90 hover:bg-primary">立即报名</Button>
                 </div>
            </Card>
       </LobbySection>
    </div>
  );
}
