import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-gray-900">
            {/* Left: Brand Side */}
            <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] text-white p-12 lg:p-20 relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight mb-8 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-5 h-5" /> Back to Home
                    </Link>
                    <div className="mt-20">
                        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
                            Account<br />
                            <span className="text-primary">Recovery</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                            계정 정보를 잊으셨나요? 걱정하지 마세요. 안전하게 계정을 찾을 수 있도록 도와드립니다.
                        </p>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]"></div>
                </div>
            </div>

            {/* Right: Form Side */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-20 relative">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">계정 찾기</h2>
                        <p className="mt-2 text-gray-500">
                            아이디 또는 비밀번호를 찾으시나요?
                        </p>
                    </div>

                    <div className="bg-white">
                        <Tabs defaultValue="id" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-none h-auto">
                                <TabsTrigger
                                    value="id"
                                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none font-semibold transition-all py-3"
                                >
                                    아이디 찾기
                                </TabsTrigger>
                                <TabsTrigger
                                    value="password"
                                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-none font-semibold transition-all py-3"
                                >
                                    비밀번호 찾기
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="id" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name-for-id" className="text-sm font-bold text-gray-700">이름</Label>
                                        <div className="relative">
                                            <Input
                                                id="name-for-id"
                                                placeholder="가입 시 등록한 이름"
                                                value={idForm.name}
                                                onChange={(e) => setIdForm({ ...idForm, name: e.target.value })}
                                                className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email-for-id" className="text-sm font-bold text-gray-700">이메일</Label>
                                        <div className="relative">
                                            <Input
                                                id="email-for-id"
                                                placeholder="example@email.com"
                                                type="email"
                                                value={idForm.email}
                                                onChange={(e) => setIdForm({ ...idForm, email: e.target.value })}
                                                className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 rounded-none transition-all shadow-none"
                                    onClick={findId}
                                    disabled={loading}
                                >
                                    {loading ? '처리중...' : '아이디 찾기'}
                                </Button>

                                {foundId && (
                                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-none text-center mt-6 animate-in zoom-in-95 duration-200">
                                        <p className="text-sm text-blue-600 font-medium mb-2">회원님의 아이디를 찾았습니다</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="text-2xl font-bold text-blue-900 tracking-tight">{foundId}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-blue-200/50">
                                            <Link to="/auth/login" className="text-sm font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                                                로그인 하러 가기 <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="password" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                {pwStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="id-for-pw" className="text-sm font-bold text-gray-700">아이디</Label>
                                                <Input
                                                    id="id-for-pw"
                                                    placeholder="아이디를 입력하세요"
                                                    value={pwForm.loginId}
                                                    onChange={(e) => setPwForm({ ...pwForm, loginId: e.target.value })}
                                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="name-for-pw" className="text-sm font-bold text-gray-700">이름</Label>
                                                <Input
                                                    id="name-for-pw"
                                                    placeholder="이름을 입력하세요"
                                                    value={pwForm.name}
                                                    onChange={(e) => setPwForm({ ...pwForm, name: e.target.value })}
                                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email-for-pw" className="text-sm font-bold text-gray-700">이메일</Label>
                                                <Input
                                                    id="email-for-pw"
                                                    placeholder="example@email.com"
                                                    type="email"
                                                    value={pwForm.email}
                                                    onChange={(e) => setPwForm({ ...pwForm, email: e.target.value })}
                                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 rounded-none transition-all shadow-none"
                                            onClick={requestAuthNumber}
                                            disabled={loading}
                                        >
                                            {loading ? '전송중...' : '인증번호 받기'}
                                        </Button>
                                    </div>
                                )}

                                {pwStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 border-l-4 border-primary rounded-none">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">인증번호 발송 완료</h3>
                                                    <div className="mt-2 text-sm text-blue-700">
                                                        <p>입력하신 이메일로 발송된 인증번호 6자리를 입력해주세요.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="auth-num" className="text-sm font-bold text-gray-700">인증번호</Label>
                                            <Input
                                                id="auth-num"
                                                placeholder="123456"
                                                value={authNumber}
                                                onChange={(e) => setAuthNumber(e.target.value)}
                                                className="h-12 text-center text-lg tracking-widest font-mono rounded-none border-gray-300 focus:border-primary focus:ring-0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 rounded-none transition-all shadow-none"
                                                onClick={verifyAuthNumber}
                                                disabled={loading}
                                            >
                                                {loading ? '확인중...' : '인증하기'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full h-10 rounded-none text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                onClick={() => setPwStep(1)}
                                            >
                                                이전 단계로
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {pwStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new-pw" className="text-sm font-bold text-gray-700">새 비밀번호</Label>
                                                <Input
                                                    id="new-pw"
                                                    type="password"
                                                    placeholder="새로운 비밀번호"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-pw" className="text-sm font-bold text-gray-700">비밀번호 확인</Label>
                                                <Input
                                                    id="confirm-pw"
                                                    type="password"
                                                    placeholder="비밀번호 재입력"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0 pl-3"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 rounded-none transition-all shadow-none"
                                            onClick={resetPassword}
                                            disabled={loading}
                                        >
                                            {loading ? '변경중...' : '비밀번호 변경 완료'}
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                            이미 계정이 있으신가요?{' '}
                            <Link to="/auth/login" className="font-bold text-primary hover:underline underline-offset-4 ml-1">
                                로그인하기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FindAccount;