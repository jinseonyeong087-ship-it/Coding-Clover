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
            {/* 로고 + 메뉴바 */}
            <div className="flex items-center gap-6">
                <Link to="/admin/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity no-underline">
                    Coding-Clover
                </Link>

                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">강좌·강의·강사</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem className="cursor-pointer" onClick={() => { navigate('/admin/course') }}>강좌 전체 목록</MenubarItem>
                            <MenubarItem className="cursor-pointer" onClick={() => { navigate('/admin/lectures') }}>강의 전체 목록</MenubarItem>
                            <MenubarItem className="cursor-pointer" onClick={() => { navigate('/admin/users/instructors') }}>강사 관리</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/coding-test') }}>코딩테스트</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/admin/payments') }}>결제관리</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">커뮤니티</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => { navigate('/student/qna') }}>Q&A</MenubarItem>
                            <MenubarItem onClick={() => { navigate('/student/community') }}>자유게시판</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>

            {/* 검색 & 로그인 */}
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
        </nav>
    );
}

export default AdminNav;
