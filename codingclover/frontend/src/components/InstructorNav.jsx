import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/Menubar"
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"
import Logout from "@/components/Logout"
import NotificationDropdown from './NotificationDropdown';

function InstructorNav() {
    const [, setLoginId] = useState(false);
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
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link to="/instructor/dashboard" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity no-underline">
                        Coding-Clover
                    </Link>
                    <Menubar className="border-none shadow-none bg-transparent p-0">
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent">강좌 관리</MenubarTrigger>
                            <MenubarContent className="bg-white border-border rounded-none shadow-lg">
                                <MenubarGroup>
                                    <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/instructor/course/new') }}>강좌 개설</MenubarItem>
                                    <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/instructor/course') }}>내 강좌</MenubarItem>
                                    <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/instructor/lecture/upload') }}>강의 업로드</MenubarItem>
                                </MenubarGroup>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent">시험 출제</MenubarTrigger>
                            <MenubarContent className="bg-white border-border rounded-none shadow-lg">
                                <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => navigate('/instructor/exam/list')}>시험 목록</MenubarItem>
                                <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => navigate('/instructor/exam/new')}>시험 출제하기</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/instructor/qna') }}>Q&A</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger onClick={() => navigate('/instructor/mypage')} className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent">마이 페이지</MenubarTrigger>
                        </MenubarMenu>
                    </Menubar>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="메뉴 검색..."
                            className="pl-9 w-64 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary transition-all rounded-none h-9"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && keyword.trim()) {
                                    navigate(`/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                                }
                            }} />
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <NotificationDropdown />
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
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
