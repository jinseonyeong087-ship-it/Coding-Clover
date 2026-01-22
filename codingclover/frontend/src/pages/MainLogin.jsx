import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Home from '@/pages/Home';
import StudentNav from '@/components/StudentNav';
import InstructorMain from '@/components/InstructorNav';
import AdminMain from '@/components/AdminNav';
import Tail from '@/components/Tail';
import Register from '@/pages/Register';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// Users 엔티티의 UsersRole enum과 일치
const UsersRole = {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    ADMIN: 'ADMIN'
};

const MainLogin = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (!loginId || !password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            // 실제 로그인 API 호출
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loginId: loginId,
                    password: password
                })
            });

            if (!response.ok) {
                // 에러 메시지 파싱 시도
                let errorMessage = '로그인에 실패했습니다.';
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMessage = errorData.message;
                } catch (e) {
                    // JSON 파싱 실패 시 기본 메시지 사용
                }
                throw new Error(errorMessage);
            }

            const userData = await response.json();
            // userData 구조: { userId, loginId, name, email, role, status }
            setUser(userData);
            setIsLoggedIn(true);
        } catch (err) {
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    // 로그인 후 role에 따라 페이지 분기
    if (isLoggedIn && user) {
        switch (user.role) {
            case UsersRole.STUDENT:
                return <Home />;
            case UsersRole.INSTRUCTOR:
                return <InstructorMain />;
            case UsersRole.ADMIN:
                // TODO: AdminMain 컴포넌트 구현 후 연결
                return <AdminMain />;
            default:
                return <Home />;
        }
    }

    // 회원가입 화면 분기
    if (isRegistering) {
        return <Register onToLogin={() => setIsRegistering(false)} />;
    }

    // 로그인 폼
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <StudentNav />
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
                        <CardDescription>
                            계정에 로그인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {error && (
                                <p className="text-sm text-destructive text-center">{error}</p>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="loginId">아이디</Label>
                                <Input
                                    id="loginId"
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="아이디를 입력하세요"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                            <Button className="w-full" onClick={handleLogin}>
                                로그인
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => setIsRegistering(true)}>
                                회원가입
                            </Button>
                            <Link to="/auth/findaccount" className='text-center'>아이디/비밀번호 찾기</Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Tail />
        </div>
    );
};

export default MainLogin;
