
'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Vote, FileText } from "lucide-react";

const proposals = [
  { 
    id: "QJP-003",
    title: "Adjust Level 4 NFT (金鼎) Upgrade Fee",
    status: "Active",
    proposer: "0x123...abc",
    description: "Proposal to increase the $JIN fee for upgrading to a Level 4 Key from 500 to 600 to increase the burn rate.",
    for: 75,
    against: 25,
    endDate: "in 2 days"
  },
  { 
    id: "QJP-002",
    title: "Increase Rebound Factor (R) Maximum to 1.8x",
    status: "Passed",
    proposer: "0x456...def",
    description: "To better compensate stakers after negative PnL epochs, this proposes increasing the R_max parameter from 1.5x to 1.8x.",
    for: 88,
    against: 12,
    endDate: "3 days ago"
  },
   { 
    id: "QJP-001",
    title: "Allocate Treasury for Marketing Campaign",
    status: "Executed",
    proposer: "0x789...ghi",
    description: "Allocate 50,000 $JIN from the treasury for a Q2 marketing campaign with partner guilds.",
    for: 95,
    against: 5,
    endDate: "2 weeks ago"
  },
];

const statusColors = {
    Active: "bg-blue-500",
    Passed: "bg-green-500",
    Executed: "bg-purple-500",
    Failed: "bg-red-500",
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2"><Vote /> DAO Governance (DAO 治理)</h1>
        <Button onClick={handleCreateProposal}>
            <FileText className="mr-2 h-4 w-4" />
            Create New Proposal (创建新提案)
        </Button>
      </div>

       <div className="space-y-6">
        {proposals.map(p => (
            <Card key={p.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{p.id}: {p.title}</CardTitle>
                            <CardDescription className="mt-1">Proposed by {p.proposer} &bull; Ends {p.endDate}</CardDescription>
                        </div>
                        <Badge className={`${statusColors[p.status as keyof typeof statusColors]}`}>{p.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                    <div>
                        <div className="mb-2">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-green-400">For (赞成)</span>
                                <span>{p.for}%</span>
                            </div>
                            <Progress value={p.for} className="h-2 [&>div]:bg-green-400" />
                        </div>
                         <div>
                             <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-red-400">Against (反对)</span>
                                <span>{p.against}%</span>
                            </div>
                            <Progress value={p.against} className="h-2 [&>div]:bg-red-400"/>
                        </div>
                    </div>
                </CardContent>
                {p.status === 'Active' && (
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => handleVote(p.id, 'Against')}>Vote Against (反对)</Button>
                        <Button onClick={() => handleVote(p.id, 'For')}>Vote For (赞成)</Button>
                    </CardFooter>
                )}
            </Card>
        ))}
       </div>
    </div>
  );
}

    