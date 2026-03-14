import React from 'react';
import { Button } from "@/components/ui/Button"
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // 서버 세션 로그아웃 요청
            await fetch('/auth/logout', {
                method: 'GET',
                credentials: 'include' // 세션 쿠키 전송
            });
        } catch (error) {
            console.error('로그아웃 요청 실패:', error);
        }

        // localStorage에서 로그인 정보 삭제
        localStorage.removeItem('loginId');
        localStorage.removeItem('users');

        alert('로그아웃 완료');
        navigate('/');
        window.location.reload(); // 새로고침
    };

    return (
        <Button size="sm" onClick={handleLogout}>로그아웃</Button>
    )
}

export default Logout;
