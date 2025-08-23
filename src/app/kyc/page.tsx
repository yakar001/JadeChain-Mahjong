
'use client';

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ShieldCheck, Camera } from 'lucide-react';

const kycLevel = 1; // Simulated KYC level

export default function KycPage() {
    const { toast } = useToast();

    const handleKyc = () => {
        toast({
            title: "认证流程启动 (Verification Process Started)",
            description: "即将跳转至认证服务页面。(You will be redirected to the verification service.)"
        });

        // Simulate redirection to an external KYC service after a short delay
        setTimeout(() => {
            window.location.href = 'https://example.com/kyc-verification-service';
        }, 1500);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary mb-6 flex items-center gap-2"><ShieldCheck /> KYC 认证中心 (KYC Center)</h1>
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>提升您的账户安全等级</CardTitle>
                    <CardDescription>提升您的KYC等级以解锁更高级别的游戏房间和功能。(Increase your KYC level to unlock higher-tier rooms and features.)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">当前等级 (Current Level)</p>
                            <p className="text-lg font-bold text-green-400">KYC Level {kycLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">下一等级 (Next Level)</p>
                            <p className="text-lg font-bold">KYC Level {kycLevel + 1}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button className="w-full" onClick={handleKyc}>
                        <Camera className="mr-2" />
                        开始 Level {kycLevel + 1} 认证 (Start Level {kycLevel + 1} Verification)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
