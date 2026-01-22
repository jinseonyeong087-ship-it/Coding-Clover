import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

function Logout() {

    const handLogout = async () => {

        const [loginId, setLoginId] = useState(true);

        useEffect(() => { })
        
        try {
            await axios.post('http://localhost:3333/auth/logout')
            localStorage.removeItem(loginId);
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
