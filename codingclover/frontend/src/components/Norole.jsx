import React from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

function Noroll() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
            <Nav />
            {/* Background Decoration */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">접근 권한이 없습니다</h1>
                        <p className="text-muted-foreground">
                            해당 페이지에 접근할 수 있는 권한이 없습니다.<br />
                            로그인 상태를 확인하거나 관리자에게 문의해주세요.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                            이전 페이지
                        </Button>
                        <Button className="flex-1" onClick={() => navigate('/')}>
                            홈으로
                        </Button>
                    </div>
                </Card>
            </main>
            <Tail />
        </div>
    );
}

export default Noroll;