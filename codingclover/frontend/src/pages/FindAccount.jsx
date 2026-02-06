import React, { useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

function FindAccount() {
    const [activeTab, setActiveTab] = useState("id");
    const navigate = useNavigate();

    const findId = () => {}

    const findPassword = () => {}

    return (
        <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
            <Nav />

            {/* Background Decoration */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <main className="flex-1 flex items-center justify-center py-20 px-4">
                <Card className="w-full max-w-md border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">계정 찾기</CardTitle>
                        <CardDescription>
                            아이디 또는 비밀번호를 잊으셨나요?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="id" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="id">아이디 찾기</TabsTrigger>
                                <TabsTrigger value="password">비밀번호 찾기</TabsTrigger>
                            </TabsList>

                            <TabsContent value="id" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-for-id">가입형 이메일</Label>
                                    <Input id="email-for-id" placeholder="example@email.com" type="email" />
                                </div>
                                <Button className="w-full font-bold">아이디 찾기</Button>
                            </TabsContent>

                            <TabsContent value="password" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id-for-pw">아이디</Label>
                                    <Input id="id-for-pw" placeholder="아이디를 입력하세요" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-for-pw">가입형 이메일</Label>
                                    <Input id="email-for-pw" placeholder="example@email.com" type="email" />
                                </div>
                                <Button className="w-full font-bold">비밀번호 재설정 이메일 발송</Button>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            <Link to="/auth/login" className="text-base text-primary hover:underline underline-offset-4">
                                로그인 화면으로 돌아가기
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Tail />
        </div>
    )
}

export default FindAccount;