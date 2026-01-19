import React, { useState } from 'react';
import Home from './Home';
import StudentNav from '../components/StudentNav';
import InstructorMain from './instructor/InstructorMain';
import Tail from '../components/Tail';

const MainLogin = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null); // 'student' 또는 'instructor'

    const handleLogin = () => {
        // TODO: 실제 로그인 API 호출 후 role 확인
        // 예시: role이 true면 학생, false면 강사
        const userRole = true; // API에서 받아온 값으로 대체
        setRole(userRole);
        setIsLoggedIn(true);
    };

    // 로그인 후 role에 따라 페이지 분기
    if (isLoggedIn) {
        return role === true ? <Home /> : <InstructorMain />;
    } else {
        return <AdminMain/>
    }

    // 로그인 폼
    return (
        <>
            <StudentNav></StudentNav>
            <div>
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
            <Tail></Tail>
        </>
    );
};

export default MainLogin;

