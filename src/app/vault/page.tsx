
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, TrendingUp, TrendingDown, Shield, DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartData = [
  { epoch: 1330, pnl: 2500, netValue: 1.02 },
  { epoch: 1331, pnl: -1200, netValue: 1.01 },
  { epoch: 1332, pnl: 3500, netValue: 1.04 },
  { epoch: 1333, pnl: 1800, netValue: 1.06 },
  { epoch: 1334, pnl: 4200, netValue: 1.10 },
  { epoch: 1335, pnl: -800, netValue: 1.09 },
  { epoch: 1336, pnl: 5500, netValue: 1.14 },
];


export default function VaultPage() {
  const latestData = chartData[chartData.length - 1];

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-2 flex items-center gap-2"><Banknote /> 金库与损益</h1>
      <p className="text-muted-foreground mb-8">金库由黄金期货量化交易策略驱动，其产生的利润将用于回购、销毁$JIN并为质押池提供分红。</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总锁仓价值 (TVL)</CardTitle>
                <DollarSign className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono">$4,567,890.12</div>
                <p className="text-xs text-muted-foreground">较上个周期 +2.1%</p>
            </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最新周期损益 (PnL)</CardTitle>
                {latestData.pnl >= 0 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold font-mono ${latestData.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {latestData.pnl >= 0 ? '+' : ''}${latestData.pnl.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">周期 #{latestData.epoch}</p>
            </CardContent>
        </Card>
         <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">回弹因子 (R-Factor)</CardTitle>
                <TrendingUp className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono">1.05x</div>
                <p className="text-xs text-muted-foreground">负 PnL 后提升奖励</p>
            </CardContent>
        </Card>
         <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">保险池 (Insurance Pool)</CardTitle>
                <Shield className="text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono">$123,456</div>
                <p className="text-xs text-muted-foreground">抵御极端回撤</p>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
            <CardTitle className="font-headline">策略损益历史 (Strategy PnL History)</CardTitle>
            <CardDescription>每个周期的黄金期货交易策略损益。</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="h-[300px] w-full">
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="epoch" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                color: "hsl(var(--card-foreground))"
                            }}
                            labelStyle={{ fontWeight: "bold", fontFamily: "var(--font-noto-serif)" }}
                            itemStyle={{ fontFamily: "monospace" }}
                        />
                        <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPnl)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
