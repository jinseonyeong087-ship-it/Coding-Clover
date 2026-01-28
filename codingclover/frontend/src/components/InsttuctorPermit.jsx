import React, { useState, useEffect } from "react";

// 유틸리티 함수
const getLoginId = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
        const userData = JSON.parse(storedUsers);
        return userData.loginId || null;
    } catch {
        return null;
    }
};

function InstructorPermit() {

    useEffect(() => {
        const loginId = getLoginId();

        // 강사 프로필 상태 조회
        fetch('/api/instructor/mypage', {
            headers: {
                'Content-Type': 'application/json',
                'X-Login-Id': loginId
            },
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                setInstructorStatus(data.status);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);



    return (<p className="text-center py-16">마이페이지에서 강사이력을 추가하여 관리자 승인 후에 이용하실 수 있습니다.</p>)
}

export default InstructorPermit;