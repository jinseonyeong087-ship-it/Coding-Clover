import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/separator';


// Users 엔티티의 UsersRole enum과 일치
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
    }, []); // [] 이거 뭐하는 용도임? []이거 무한루프 방지용임

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    const handleLogin = async () => {

        setError('');

        // if (!loginId || !password) {
        //     setError('아이디, 비밀번호를 입력해 주세요.');
        //     return;
        // };

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    loginId: loginId,
                    password: password
                })
            });

            console.log("try 구문 성공");

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || '새로고침 후 시도해 주세요.');
                return;
            }

            const userData = await response.json();

            localStorage.setItem("users", JSON.stringify(userData));

            if (loginId && password) {
                localStorage.setItem("loginId", true);
                setLoginId('');
                switch (userData.role) {
                    case UsersRole.STUDENT:
                        navigate('/');
                        break;
                    case UsersRole.INSTRUCTOR:
                        navigate('/instructor/dashboard');
                        break;
                    case UsersRole.ADMIN:
                        navigate('/admin/dashboard');
                        break;
                    default:
                        navigate('/');
                        break;
                }
            };
        } catch (err) {
            setError(err.message || '정의되지 않은 변수 참조, 함수 호출 실패, 데이터 타입 불일치');
            return;
        }
    };

    return (

        <div className="flex min-h-screen flex-col bg-background">
            <Nav />
            <main className="flex flex-1 items-center justify-center py-12 px-4 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <Card className="w-full max-w-md border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-2 text-center pb-8 pt-8">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">로그인</CardTitle>
                        <CardDescription className="text-base">
                            Coding-Clover에 오신 것을 환영합니다
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loginId" className="text-sm font-semibold ml-1">아이디</Label>
                                    <Input
                                        id="loginId"
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="아이디를 입력하세요"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password" className="text-sm font-semibold ml-1">비밀번호</Label>

                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="비밀번호를 입력하세요"
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button className="w-full h-11 text-base shadow-lg hover:shadow-primary/25" variant="default" onClick={handleLogin} type="submit">
                                    로그인
                                </Button>
                                <Link to="/auth/register" className="block">
                                    <Button variant="outline" className="w-full h-11 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                                        회원가입
                                    </Button>
                                </Link>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/60" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background/60 backdrop-blur-xl px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="h-12 hover:bg-[#FEE500] hover:text-black hover:border-[#FEE500] hover:-translate-y-0.5 transition-all duration-300" onClick={() => handleSocialLogin('kakao')}>
                                    <span className="font-bold">Kakao</span>
                                </Button>
                                <Button variant="outline" className="h-12 hover:bg-[#03C75A] hover:text-white hover:border-[#03C75A] hover:-translate-y-0.5 transition-all duration-300" onClick={() => handleSocialLogin('naver')}>
                                    <span className="font-bold">Naver</span>
                                </Button>
                                <Button variant="outline" className="h-12 hover:bg-[#4285F4] hover:text-white hover:border-[#4285F4] hover:-translate-y-0.5 transition-all duration-300" onClick={() => handleSocialLogin('google')}>
                                    <span className="font-bold">Google</span>
                                </Button>
                            </div>
                            <Separator />
                            <Link to="/auth/findReques" className="text-base text-muted-foreground hover:text-primary transition-colors align-center w-full text-center block">
                                아이디 / 비밀번호를 잊으셨나요?
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Tail />
        </div>
    );
};




export default MainLogin;
