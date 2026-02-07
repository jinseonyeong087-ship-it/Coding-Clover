import React, { useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import axios from 'axios';

function FindAccount() {
    const [activeTab, setActiveTab] = useState("id");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 아이디 찾기 상태
    const [idForm, setIdForm] = useState({ name: '', email: '' });
    const [foundId, setFoundId] = useState(null);

    // 비밀번호 찾기 상태
    const [pwStep, setPwStep] = useState(1); // 1: 정보입력, 2: 인증번호, 3: 비번변경
    const [pwForm, setPwForm] = useState({ loginId: '', name: '', email: '' });
    const [authNumber, setAuthNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const findId = async () => {
        if (!idForm.name || !idForm.email) {
            alert('이름과 이메일을 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/findRequest', {
                type: 'id',
                name: idForm.name,
                email: idForm.email
            });
            setFoundId(res.data.loginId);
        } catch (err) {
            alert(err.response?.data?.message || '아이디 찾기 실패');
            setFoundId(null);
        } finally {
            setLoading(false);
        }
    }

    const requestAuthNumber = async () => {
        if (!pwForm.loginId || !pwForm.name || !pwForm.email) {
            alert('모든 정보를 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/findRequest', {
                type: 'pw',
                loginId: pwForm.loginId,
                name: pwForm.name,
                email: pwForm.email
            });
            alert(res.data.message);
            setPwStep(2);
        } catch (err) {
            alert(err.response?.data?.message || '사용자 확인 실패');
        } finally {
            setLoading(false);
        }
    }

    const verifyAuthNumber = async () => {
        if (!authNumber) {
            alert('인증번호를 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/findRequest', {
                type: 'verify',
                authNumber: authNumber
            });
            alert(res.data.message);
            setPwStep(3);
        } catch (err) {
            alert(err.response?.data?.message || '인증 실패');
        } finally {
            setLoading(false);
        }
    }

    const resetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/findRequest', {
                type: 'reset',
                loginId: pwForm.loginId, // 세션에 저장된 정보를 쓰지 않고, 다시 보내지만 검증은 세션의 isPwVerified로 함
                newPassword: newPassword
            });
            alert(res.data.message);
            navigate('/auth/login');
        } catch (err) {
            alert(err.response?.data?.message || '비밀번호 변경 실패');
        } finally {
            setLoading(false);
        }
    }

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
                                    <Label htmlFor="name-for-id">이름</Label>
                                    <Input
                                        id="name-for-id"
                                        placeholder="이름을 입력하세요"
                                        value={idForm.name}
                                        onChange={(e) => setIdForm({ ...idForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-for-id">가입형 이메일</Label>
                                    <Input
                                        id="email-for-id"
                                        placeholder="example@email.com"
                                        type="email"
                                        value={idForm.email}
                                        onChange={(e) => setIdForm({ ...idForm, email: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full font-bold" onClick={findId} disabled={loading}>
                                    {loading ? '처리중...' : '아이디 찾기'}
                                </Button>
                                {foundId && (
                                    <div className="p-4 bg-muted/50 rounded-lg text-center mt-4 border border-primary/20">
                                        <p className="text-sm text-muted-foreground mb-1">찾은 아이디</p>
                                        <p className="text-xl font-bold text-primary">{foundId}</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="password" className="space-y-4">
                                {pwStep === 1 && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="id-for-pw">아이디</Label>
                                            <Input
                                                id="id-for-pw"
                                                placeholder="아이디를 입력하세요"
                                                value={pwForm.loginId}
                                                onChange={(e) => setPwForm({ ...pwForm, loginId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name-for-pw">이름</Label>
                                            <Input
                                                id="name-for-pw"
                                                placeholder="이름을 입력하세요"
                                                value={pwForm.name}
                                                onChange={(e) => setPwForm({ ...pwForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email-for-pw">가입형 이메일</Label>
                                            <Input
                                                id="email-for-pw"
                                                placeholder="example@email.com"
                                                type="email"
                                                value={pwForm.email}
                                                onChange={(e) => setPwForm({ ...pwForm, email: e.target.value })}
                                            />
                                        </div>
                                        <Button className="w-full font-bold" onClick={requestAuthNumber} disabled={loading}>
                                            {loading ? '전송중...' : '인증번호 받기'}
                                        </Button>
                                    </>
                                )}

                                {pwStep === 2 && (
                                    <>
                                        <div className="bg-primary/5 p-4 rounded-lg mb-4 text-sm text-muted-foreground">
                                            이메일로 발송된 인증번호 6자리를 입력해주세요.
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="auth-num">인증번호</Label>
                                            <Input
                                                id="auth-num"
                                                placeholder="123456"
                                                value={authNumber}
                                                onChange={(e) => setAuthNumber(e.target.value)}
                                            />
                                        </div>
                                        <Button className="w-full font-bold" onClick={verifyAuthNumber} disabled={loading}>
                                            {loading ? '확인중...' : '인증하기'}
                                        </Button>
                                        <Button variant="ghost" className="w-full mt-2" onClick={() => setPwStep(1)}>
                                            이전으로
                                        </Button>
                                    </>
                                )}

                                {pwStep === 3 && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-pw">새 비밀번호</Label>
                                            <Input
                                                id="new-pw"
                                                type="password"
                                                placeholder="새 비밀번호 입력"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-pw">비밀번호 확인</Label>
                                            <Input
                                                id="confirm-pw"
                                                type="password"
                                                placeholder="새 비밀번호 확인"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <Button className="w-full font-bold" onClick={resetPassword} disabled={loading}>
                                            {loading ? '변경중...' : '비밀번호 변경하기'}
                                        </Button>
                                    </>
                                )}
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