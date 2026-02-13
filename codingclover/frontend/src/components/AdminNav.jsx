import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import NotificationDropdown from './NotificationDropdown';

function AdminNav() {
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
                {/* 로고 + 메뉴바 */}
                <div className="flex items-center gap-8">
                <Link to="/admin/dashboard" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity no-underline">
                    Coding-Clover
                </Link>

                <Menubar className="border-none shadow-none bg-transparent p-0">
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent">강좌·강의·강사</MenubarTrigger>
                        <MenubarContent className="bg-white border-border rounded-none shadow-lg">
                            <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/admin/course') }}>강좌 전체 목록</MenubarItem>
                            <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/admin/lectures') }}>강의 전체 목록</MenubarItem>
                            <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/admin/users/instructors') }}>강사 관리</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/coding-test') }}>코딩테스트</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/admin/payments') }}>결제관리</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent" onClick={() => { navigate('/admin/users/students') }}>학생 관리</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer font-bold text-gray-700 hover:text-primary data-[state=open]:bg-transparent focus:bg-transparent">커뮤니티</MenubarTrigger>
                        <MenubarContent className="bg-white border-border rounded-none shadow-lg">
                            <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/student/qna') }}>Q&A</MenubarItem>
                            <MenubarItem className="focus:bg-gray-50 focus:text-primary rounded-none cursor-pointer" onClick={() => { navigate('/student/community') }}>자유게시판</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
                </div>

            {/* 검색 & 로그인 */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="메뉴 검색..."
                        className="pl-9 w-48 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary transition-all rounded-none h-9"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && keyword.trim()) {
                                navigate(`/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                            }
                        }} />
                </div>

                <NotificationDropdown />
                <Button variant="ghost" className="text-sm font-bold text-gray-700 rounded-none">{users.name}님</Button>
                <Logout />
            </div>
            </div>
        </nav>
    );
}

export default AdminNav;
