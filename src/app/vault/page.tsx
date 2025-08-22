'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, TrendingUp, TrendingDown, Shield } from "lucide-react";
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
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-2"><Banknote /> 金库与损益 (Gold Futures Vault & PnL)</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总锁仓价值 (Total Value Locked)</CardTitle>
                <span className="text-muted-foreground">$</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$4,567,890.12</div>
                <p className="text-xs text-muted-foreground">较上个周期 +2.1% (+2.1% from last epoch)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最新周期损益 (Latest Epoch PnL)</CardTitle>
                <TrendingUp className="text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">+$5,500</div>
                <p className="text-xs text-muted-foreground">周期 #1336 (Epoch #1336)</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">回弹因子 (Rebound Factor (R))</CardTitle>
                <TrendingUp className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1.05x</div>
                <p className="text-xs text-muted-foreground">负 PnL 后提升奖励 (Boosts rewards after negative PnL)</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">保险池 (Insurance Pool)</CardTitle>
                <Shield className="text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$123,456</div>
                <p className="text-xs text-muted-foreground">抵御极端回撤 (Protects against severe drawdowns)</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>策略损益历史 (Strategy PnL History)</CardTitle>
            <CardDescription>每个周期的黄金期货交易策略损益。(Profit and Loss from the gold futures trading strategy per epoch.)</CardDescription>
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
                            labelStyle={{ fontWeight: "bold" }}
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
