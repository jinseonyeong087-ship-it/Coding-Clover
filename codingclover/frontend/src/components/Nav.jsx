import React, { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import InstructorNav from './InstructorNav';
import StudentNav from './StudentNav';

function Nav() {
    const [role, setRole] = useState(null);
    const [loginId, setLoginId] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const storedLoginId = localStorage.getItem("loginId");
            const storedUsers = localStorage.getItem("users");

            if (storedLoginId === "true" && storedUsers) {
                setLoginId(true);
                setRole(JSON.parse(storedUsers).role);
            }

            // 항상 서버 세션과 동기화하거나, 로컬 스토리지가 없을 때 확인
            // 소셜 로그인 리다이렉트 직후에는 로컬 스토리지가 비어있으므로 이 과정이 필수
            if (!storedLoginId || !storedUsers) {
                try {
                    const res = await fetch('/auth/status');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.loggedIn) {
                            localStorage.setItem("loginId", "true");
                            localStorage.setItem("users", JSON.stringify(data.user));

                            setLoginId(true);
                            setRole(data.user.role);
                        }
                    }
                } catch (e) {
                    console.error("Login status check failed:", e);
                }
            }
        };

        checkLoginStatus();
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