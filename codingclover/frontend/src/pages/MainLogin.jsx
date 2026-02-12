import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const UsersRole = {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    ADMIN: 'ADMIN'
};

const MainLogin = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSocialLogin = (provider) => {
        window.location.href = `http://localhost:3333/oauth2/authorization/${provider}`;
    };

    useEffect(() => {
        const secureLocalStorage = localStorage.getItem("loginId");
        if (secureLocalStorage === "true") {
            setLoginId('');
        }
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ loginId, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || '로그인에 실패했습니다.');
                return;
            }

            const userData = await response.json();
            localStorage.setItem("users", JSON.stringify(userData));

            if (loginId && password) {
                localStorage.setItem("loginId", true);
                setLoginId('');
                switch (userData.role) {
                    case UsersRole.STUDENT: navigate('/'); break;
                    case UsersRole.INSTRUCTOR: navigate('/instructor/dashboard'); break;
                    case UsersRole.ADMIN: navigate('/admin/dashboard'); break;
                    default: navigate('/'); break;
                }
            }
        } catch (err) {
            setError(err.message || '로그인 요청 중 오류가 발생했습니다.');
        }
    };

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
                            Welcome Back to<br />
                            <span className="text-primary">Coding-Clover</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                            개발자의 성장을 위한 최적의 플랫폼. 지금 로그인하여 학습을 이어나가세요.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <span className="text-lg font-medium text-gray-300">체계적인 커리큘럼</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <span className="text-lg font-medium text-gray-300">실전 코딩 테스트</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <span className="text-lg font-medium text-gray-300">전문 강사진의 피드백</span>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary rounded-full blur-[150px]"></div>
                </div>
            </div>

            {/* Right: Login Form Side */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-20 relative">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">로그인</h2>
                        <p className="mt-2 text-gray-500">계정이 없으신가요? <Link to="/auth/Register" className="font-bold text-primary hover:underline">회원가입</Link></p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium border-l-4 border-red-500">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loginId" className="text-sm font-bold text-gray-700">아이디</Label>
                                <Input
                                    id="loginId"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your ID"
                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-bold text-gray-700">비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your password"
                                    className="h-12 rounded-none border-gray-300 focus:border-primary focus:ring-0"
                                />
                            </div>
                        </div>

                        <Button onClick={handleLogin} className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-none shadow-none">
                            로그인
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Button variant="outline" className="h-12 rounded-none border-gray-200 hover:bg-[#FEE500] hover:border-[#FEE500] hover:text-black transition-all" onClick={() => handleSocialLogin('kakao')}>
                                Kakao
                            </Button>
                            <Button variant="outline" className="h-12 rounded-none border-gray-200 hover:bg-[#03C75A] hover:border-[#03C75A] hover:text-white transition-all" onClick={() => handleSocialLogin('naver')}>
                                Naver
                            </Button>
                            <Button variant="outline" className="h-12 rounded-none border-gray-200 hover:bg-[#4285F4] hover:border-[#4285F4] hover:text-white transition-all" onClick={() => handleSocialLogin('google')}>
                                Google
                            </Button>
                        </div>

                        <div className="text-center mt-2">
                            <Link to="/auth/findReques" className="text-xs font-medium text-gray-500 hover:text-primary hover:underline transition-colors">
                                아이디/비밀번호 찾기
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLogin;
