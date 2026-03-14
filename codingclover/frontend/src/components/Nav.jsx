import React, { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import InstructorNav from './InstructorNav';
import StudentNav from './StudentNav';

function Nav() {
    const [role, setRole] = useState(null);
    const [loginId, setLoginId] = useState(false);

    useEffect(() => {
        const storedLoginId = localStorage.getItem("loginId");
        const storedUsers = localStorage.getItem("users");

        if (storedLoginId === "true") {
            setLoginId(true);
        }

        if (storedUsers) {
            const userData = JSON.parse(storedUsers);
            // ApiLoginSuccess.java에서 "role"이라는 키로 응답을 보내므로 이를 참조합니다.
            setRole(userData.role);
        }
    }, []);

    // 1. 로그인하지 않은 상태일 때 (디폴트)
    if (!loginId) {
        return <StudentNav />;
    }

    // 2. 로그인 상태일 때 UsersRole에 따른 분기
    // Users.java의 UsersRole 열거형 값(ADMIN, INSTRUCTOR, STUDENT)을 기준으로 합니다.
    switch (role) {
        case 'ADMIN':
            return <AdminNav />;
        case 'INSTRUCTOR':
            return <InstructorNav />;
        case 'STUDENT':
            return <StudentNav />;
        default:
            // 역할 정보가 없거나 일치하지 않을 경우 기본 학생용 Nav 표시
            return <StudentNav />;
    }
}

export default Nav;