
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ShieldCheck, Camera, Fingerprint, User, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Stepper, Step, StepIndicator, StepStatus, StepNumber, StepTitle, StepDescription, StepSeparator, Box } from '@/components/ui/stepper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const kycSteps = [
  { 
    level: 1, 
    title: "基础认证 (Level 1)",
    description: "验证基本身份信息",
    privileges: "解锁高手场 (Unlocks Expert Rooms)"
  },
  {
    level: 2,
    title: "高级认证 (Level 2)",
    description: "人脸识别与证件上传",
    privileges: "解锁大师场与市场交易 (Unlocks Master Rooms & Marketplace Trading)"
  },
  {
    level: 3,
    title: "顶级认证 (Level 3)",
    description: "生物识别验证",
    privileges: "解锁未来金融功能 (Unlocks Future Financial Features)"
  }
];

// Simulate the user's current KYC level
const CURRENT_KYC_LEVEL = 0; 

export default function KycPage() {
    const { toast } = useToast();
    const [activeStep, setActiveStep] = useState(CURRENT_KYC_LEVEL);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // This effect handles the camera permission for the face recognition step
    useEffect(() => {
        if (activeStep !== 1) {
            // Stop camera stream if not on the face recognition step
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            return;
        }

        const getCameraPermission = async () => {
            setIsLoading(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: '摄像头访问被拒绝 (Camera Access Denied)',
                    description: '请在您的浏览器设置中允许摄像头权限以继续认证。',
                });
            } finally {
                setIsLoading(false);
            }
        };

        getCameraPermission();
        
        // Cleanup function to stop camera when component unmounts or step changes
        return () => {
             if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }

    }, [activeStep, toast]);

    const handleVerification = async (step: number) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // On successful simulation
        toast({
            title: `认证成功 (Verification Successful)`,
            description: `您已成功完成 Level ${step} 认证。`,
            className: "bg-green-500 text-white"
        });
        setActiveStep(step);
        setIsLoading(false);
    }
    
    const renderStepContent = (stepIndex: number) => {
        if (stepIndex < activeStep) {
             return (
                <div className="p-4 rounded-lg bg-green-500/10 text-green-400 flex items-center gap-2">
                    <CheckCircle />
                    <p>您已于 [模拟日期] 完成此等级认证。</p>
                </div>
            )
        }
        
        if (stepIndex > activeStep) {
             return (
                <div className="p-4 rounded-lg bg-muted text-muted-foreground">
                    <p>请先完成之前的认证步骤。</p>
                </div>
            )
        }

        // Current step to be completed
        switch(stepIndex) {
            case 0: // Level 1: Basic Info
                return (
                    <CardFooter className="flex-col items-stretch gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="fullName">姓名 (Full Name)</Label>
                             <Input id="fullName" placeholder="请输入您的真实姓名" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="idNumber">身份证号 (ID Number)</Label>
                             <Input id="idNumber" placeholder="请输入您的身份证号码" />
                        </div>
                        <Button className="w-full" onClick={() => handleVerification(1)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <User className="mr-2" />}
                            提交并开始 Level 1 认证
                        </Button>
                    </CardFooter>
                );
            case 1: // Level 2: Face Recognition
                return (
                    <CardFooter className="flex-col items-stretch gap-4">
                        <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center relative">
                            <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
                            {hasCameraPermission === false && (
                                <Alert variant="destructive" className="w-auto absolute">
                                    <Camera className="h-4 w-4"/>
                                    <AlertTitle>摄像头权限被拒绝</AlertTitle>
                                    <AlertDescription>
                                        请在浏览器设置中允许访问摄像头。
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <Button className="w-full" onClick={() => handleVerification(2)} disabled={isLoading || !hasCameraPermission}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Camera className="mr-2" />}
                            开始 Level 2 人脸识别
                        </Button>
                    </CardFooter>
                )
             case 2: // Level 3: Fingerprint
                return (
                    <CardFooter className="flex-col items-stretch gap-4">
                        <div className="flex justify-center items-center p-8">
                            <Fingerprint className={`w-24 h-24 text-primary ${isLoading ? 'animate-pulse' : ''}`} />
                        </div>
                        <p className="text-center text-muted-foreground">请将手指放在设备的指纹识别器上以完成认证。</p>
                         <Button className="w-full" onClick={() => handleVerification(3)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Fingerprint className="mr-2" />}
                            开始 Level 3 指纹认证
                        </Button>
                    </CardFooter>
                )
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2"><ShieldCheck /> KYC 认证中心 (KYC Center)</h1>
              <p className="text-muted-foreground mt-2">完成认证以解锁更高级别的游戏房间和功能，提升您的账户安全。(Complete verification to unlock higher-tier rooms, features, and enhance your account security.)</p>
            </div>
             
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Stepper orientation="vertical" index={activeStep} className="gap-0">
                        {kycSteps.map((step, index) => (
                            <Step key={index} className="gap-4">
                                <StepIndicator>
                                    <StepStatus complete={<CheckCircle />} incomplete={<StepNumber />} active={<Loader2 className="animate-spin"/>} />
                                </StepIndicator>
                                <Box>
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Box>
                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </div>

                <div className="lg:col-span-2">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>
                                {activeStep >= kycSteps.length ? "所有认证已完成" : `${kycSteps[activeStep].title}`}
                            </CardTitle>
                            <CardDescription>
                                {activeStep >= kycSteps.length ? "您的账户已达到最高安全等级。" : `完成此步骤以解锁: ${kycSteps[activeStep].privileges}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderStepContent(activeStep)}
                        </CardContent>
                    </Card>

                    {/* Show next steps if not on the last one */}
                    {activeStep < kycSteps.length -1 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">后续步骤 (Next Steps)</h3>
                             <Card className="bg-muted border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{kycSteps[activeStep + 1].title}</span>
                                        <ArrowRight />
                                    </CardTitle>
                                    <CardDescription>
                                        解锁: {kycSteps[activeStep + 1].privileges}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    )}
                </div>
             </div>
        </div>
    )
}
