
'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Vote, FileText, PackagePlus } from "lucide-react";

// In production, this data will be fetched from the DAO smart contract.
const proposals = [
  {
    id: "QGP-001",
    title: "调整新手场入场费 (Adjust Novice Room Fee)",
    proposer: "0x1234...abcd",
    endDate: "2024-08-15",
    status: "Active",
    description: "建议将新手场的入场费从10 $JIN 降低到 5 $JIN，以吸引更多新玩家，提升社区活跃度。",
    for: 72,
    against: 28,
  },
  {
    id: "QGP-002",
    title: "开启首届“泉金杯”锦标赛 (Launch 'QuanJin Cup' Tournament)",
    proposer: "0x5678...efgh",
    endDate: "2024-08-10",
    status: "Passed",
    description: "提议于九月第一周举办大型线上锦标赛，总奖池为 1,000,000 $JIN，旨在提升品牌知名度。",
    for: 95,
    against: 5,
  },
  {
    id: "QGP-003",
    title: "增加金龙NFT能量上限 (Increase Golden Dragon NFT Energy Cap)",
    proposer: "0x90ab...cdef",
    endDate: "2024-08-01",
    status: "Failed",
    description: "提案建议将金龙NFT的能量上限从500提升至600，以奖励顶级持有者。",
    for: 40,
    against: 60,
  }
];

const statusConfig = {
    Active: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "投票中 (Active)" },
    Passed: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "已通过 (Passed)" },
    Executed: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "已执行 (Executed)" },
    Failed: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "未通过 (Failed)" },
}


export default function DaoPage() {
  const { toast } = useToast();

  const handleVote = (proposalId: string, vote: 'For' | 'Against') => {
    toast({
      title: "投票成功 (Vote Cast)",
      description: `您已对提案 ${proposalId} 投了 ${vote} 票。`,
    });
  };

  const handleCreateProposal = () => {
    toast({
      title: "功能暂未开放 (Feature Not Available)",
      description: "创建新提案的功能正在开发中。",
      variant: "default",
    });
  };

  const EmptyState = () => (
    <Card className="bg-card/50">
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <div className="p-3 bg-accent rounded-full mb-4">
                <PackagePlus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">暂无治理提案</h3>
            <p>当前没有活跃或已结束的社区治理提案。</p>
        </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2"><Vote /> DAO 治理 (DAO Governance)</h1>
          <p className="text-muted-foreground mt-2">参与社区治理，共同决定泉金麻将的未来。</p>
        </div>
        <Button onClick={handleCreateProposal} size="lg">
            <FileText className="mr-2 h-4 w-4" />
            创建新提案
        </Button>
      </div>

       <div className="space-y-6">
        {proposals.length > 0 ? (
            proposals.map(p => {
              const config = statusConfig[p.status as keyof typeof statusConfig];
              return (
                <Card key={p.id} className="bg-card/80 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-2">
                            <div>
                                <CardTitle className="font-headline text-xl">{p.id}: {p.title}</CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                  由 <span className="font-mono text-primary/80">{p.proposer}</span> 提案 &bull; 结束于 {p.endDate}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className={`whitespace-nowrap ${config.color}`}>{config.label}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-6">{p.description}</p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-semibold text-green-400">赞成 (For)</span>
                                    <span className="font-mono">{p.for.toFixed(2)}%</span>
                                </div>
                                <Progress value={p.for} className="h-2 [&>div]:bg-green-400" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-semibold text-red-400">反对 (Against)</span>
                                    <span className="font-mono">{p.against.toFixed(2)}%</span>
                                </div>
                                <Progress value={p.against} className="h-2 [&>div]:bg-red-400"/>
                            </div>
                        </div>
                    </CardContent>
                    {p.status === 'Active' && (
                        <CardFooter className="flex justify-end gap-4 border-t border-primary/10 pt-4 mt-4">
                            <Button variant="outline" onClick={() => handleVote(p.id, 'Against')}>投反对票 (Vote Against)</Button>
                            <Button onClick={() => handleVote(p.id, 'For')}>投赞成票 (Vote For)</Button>
                        </CardFooter>
                    )}
                </Card>
            )})
        ) : (
            <EmptyState />
        )}
       </div>
    </div>
  );
}
