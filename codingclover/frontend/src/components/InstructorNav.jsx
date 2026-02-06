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
import NotificationDropdown from './NotificationDropdown';

function InstructorNav() {
    const [loginId, setLoginId] = useState(false);
    const [users, setUsers] = useState({ name: '' });
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedLoginId = localStorage.getItem("loginId");
        const storedUsers = localStorage.getItem("users");

        if (storedLoginId === "true") {
            setLoginId(true);
        }
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }
    }, []);
    return (
        <nav className="flex mx-auto w-full justify-between py-3 px-16 border-b fixed bg-white z-50">
            <div className="flex items-center gap-6">
                <Link to="/instructor/dashboard" className="text-xl font-bold text-primary no-underline">
                    Coding-Clover
                </Link>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">강좌 관리</MenubarTrigger>
                        <MenubarContent>
                            <MenubarGroup>
                                <MenubarItem>내 강의</MenubarItem>
                                <MenubarItem>강좌 개설 신청</MenubarItem>
                                <MenubarItem>강의 업로드</MenubarItem>
                            </MenubarGroup>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">시험 제출</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>시험 제출하기</MenubarItem>
                            <MenubarItem>시험 결과</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/test/qna') }}>Q&A 답변관리</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>수강생 질문</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={() => navigate('/instructor/mypage')} className="cursor-pointer">마이 페이지</MenubarTrigger>
                    </MenubarMenu>
                </Menubar>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="메뉴 검색..."
                        className="pl-9 w-48"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && keyword.trim()) {
                                navigate(`/test/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                            }
                        }} />
                </div>

                <NotificationDropdown />
                <Button variant="ghost" className="text-sm">{users.name}님</Button>
                <Logout />
            </div>
        </nav >
    );
}

export default InstructorNav;
