import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

function Logout() {

    const handLogout = async () => {

        const [loginId, setLoginId] = useState(false);
        const [user, setUser] = useState(null);

        useEffect(() => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
                setIsLoggedIn(true);
            }
        }, []);

        try {
            await axios.post('http://localhost:3333/auth/logout', {})
            localStorage.removeItem(loginId);
            setLoginId(false);
            setUser(null);
            alert('로그아웃 완료');
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 에러:', error);
        }
    }

    return (
        <Button size="sm" onClick={handLogout}><Link to="/">로그아웃</Link></Button>
    )
}

export default Logout;
