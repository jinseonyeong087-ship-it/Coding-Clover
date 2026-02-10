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
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm transition-all">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link to="/instructor/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity no-underline">
                        Coding-Clover
                        {/* <span className="ml-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">Instructor</span> */}
                    </Link>
                    <Menubar className="border-none shadow-none bg-transparent">
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">강좌 관리</MenubarTrigger>
                            <MenubarContent>
                                <MenubarGroup>
                                    <MenubarItem onClick={() => { navigate('/instructor/course/new') }}>강좌 개설</MenubarItem>
                                    <MenubarItem onClick={() => { navigate('/instructor/course') }}>내 강좌</MenubarItem>
                                    <MenubarItem onClick={() => { navigate('/instructor/lecture/upload') }}>강의 업로드</MenubarItem>
                                </MenubarGroup>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">시험 제출</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={() => navigate('/instructor/exam/list')}>시험 목록</MenubarItem>
                                <MenubarItem onClick={() => navigate('/instructor/exam/new')}>시험 제출하기</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => { navigate('/instructor/qna') }}>Q&A 답변관리</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={() => { navigate('/instructor/qna') }}>수강생 질문</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger onClick={() => navigate('/instructor/mypage')} className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">마이 페이지</MenubarTrigger>
                        </MenubarMenu>
                    </Menubar>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="메뉴 검색..."
                            className="pl-9 w-64 bg-secondary/50 border-transparent focus:bg-background transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && keyword.trim()) {
                                    navigate(`/test/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                                }
                            }} />
                    </div>

                    <div className="flex items-center gap-3 pl-2 border-l border-border/50">
                        <NotificationDropdown />
                        <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm">
                            {users.name} 강사님
                        </div>
                        <Logout />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default InstructorNav;
