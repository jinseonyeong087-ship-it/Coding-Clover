import React from 'react';
import { Button } from "@/components/ui/Button"
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
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
