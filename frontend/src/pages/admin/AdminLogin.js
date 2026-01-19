import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const [login_id, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [roll, setRoll] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = () => {
        setRoll(true);

        if (roll === 'admin') {
            navigate('/admin/dashboard');
        } else {
            setErrorMessage('관리자 권한이 없습니다.');
        }
    };

    return (
        <div>
            <h2>관리자 로그인</h2>
            <div>
                아이디 <input
                    value={login_id}
                    onChange={(e) => setLoginId(e.target.value)}
                />
            </div>
            <div>
                비밀번호 <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <a href='#' onClick={handleLogin}>
                로그인
            </a>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}

export default AdminLogin;

