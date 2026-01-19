import React, { useState } from 'react';
import Home from './Home';
import StudentNav from '../components/StudentNav';
import InstructorMain from './instructor/InstructorMain';
import Tail from '../components/Tail';

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

    const handleLogin = async () => {
        setError('');

        if (!loginId || !password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            // TODO: 실제 로그인 API 호출
            const response = await fetch('/api/auth/login', {
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
                throw new Error('로그인에 실패했습니다.');
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
                return <Home />;
            default:
                return <Home />;
        }
    }

    // 로그인 폼
    return (
        <>
            <StudentNav />
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                />
                <button type="submit" onClick={handleLogin}>
                    로그인
                </button>
            </div>
            <Tail />
        </>
    );
};

export default MainLogin;

