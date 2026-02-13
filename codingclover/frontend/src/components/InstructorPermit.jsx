import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import Tail from "./Tail";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

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
    const [, setInstructorStatus] = useState(null);
    const [, setLoading] = useState(true);
    const navigate = useNavigate();

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



    return (
        <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">승인 대기 중</h2>
                <p className="text-muted-foreground mb-8">
                    강사이력을 추가하신 후,<br />
                    관리자 승인 후에 이용하실 수 있습니다.
                </p>
                <Button onClick={() => navigate('/instructor/mypage')}>
                    강사 이력 추가하기
                </Button>
            </main>
            <Tail />
        </div>
    )
}

export default InstructorPermit;