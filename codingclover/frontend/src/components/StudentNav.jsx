import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/Menubar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"
import Logout from "@/components/Logout"
import axios from 'axios';

function StudentNav() {
    const [loginId, setLoginId] = useState(false);
    const [users, setUsers] = useState({ name: '' });
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const storedLoginId = localStorage.getItem("loginId");
            const storedUsers = localStorage.getItem("users");

            if (storedLoginId === "true" && storedUsers) {
                setLoginId(true);
                const parsedUsers = JSON.parse(storedUsers);
                setUsers(parsedUsers);
                console.log("현재 로그인한 사용자:", parsedUsers);
            }

            // 소셜 로그인 리다이렉트 처리 (세션 확인)
            if (!storedLoginId || !storedUsers) {
                try {
                    const res = await fetch('/auth/status', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include' // 세션 쿠키 포함 필수
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.loggedIn) {
                            localStorage.setItem("loginId", "true");
                            localStorage.setItem("users", JSON.stringify(data.user));

                            setLoginId(true);
                            setUsers(data.user);
                            console.log("소셜 로그인 감지 및 정보 갱신:", data.user);

                            // 상태 갱신을 위해 새로고침 (선택 사항, 필요시 주석 해제)
                            // window.location.reload(); 
                        }
                    }
                } catch (e) {
                    console.error("Login status check failed:", e);
                }
            }
        };

        checkLoginStatus();
    }, []);

    // 저장할 때: JSON.stringify()로 객체 → 문자열 변환
    // 불러올 때: JSON.parse()로 문자열 → 객체 변환

    return (
        <nav className="container mx-auto flex items-center justify-between py-3 border-b bg-background">
            {/* 로고 + 메뉴바 */}
            <div className="flex items-center gap-6">
                <Link to="/" className="text-xl font-bold text-primary no-underline">
                    Coding-Clover
                </Link>

                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">전체 강좌</MenubarTrigger>
                        <MenubarContent>
                            <MenubarGroup>
                                <Link to="/course/level/1"><MenubarItem>초급</MenubarItem></Link>
                                <Link to="/course/level/2"><MenubarItem>중급</MenubarItem></Link>
                                <Link to="/course/level/3"><MenubarItem>고급</MenubarItem></Link>
                            </MenubarGroup>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">내 강의실</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>수강 중인 강좌</MenubarItem>
                            <MenubarItem>완료한 강좌</MenubarItem>
                            <MenubarItem>학습 기록</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">커뮤니티</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => { navigate('/test/qna') }}>Q&A</MenubarItem>
                            <MenubarItem onClick={() => { navigate('/student/community') }}>자유게시판</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/test/coding') }}>코딩테스트</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <Link
                            to="/student/mypage"
                            className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            마이페이지
                        </Link>
                    </MenubarMenu>
                </Menubar>
            </div>

            {/* 검색 & 로그인 */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="강좌 검색..."
                        className="pl-9 w-48"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && keyword.trim()) {
                                navigate(`/test/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                            }
                        }} />
                </div>
                {!loginId ? (
                    <Button size="sm"><Link to="/auth/login">로그인</Link></Button>)
                    : (<>
                        <Button variant="ghost" className="text-sm">{users.name}님</Button>
                        <Logout />
                    </>)}

                {/* <Button size="sm"><Link to="/auth/register">회원가입</Link></Button> */}
            </div>
        </nav>
    );
}

export default StudentNav;
