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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

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
                <Link to="/admin/dashboard" className="text-xl font-bold text-primary no-underline">
                    Coding-Clover
                </Link>

                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">강좌·강의·강사</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem className="cursor-pointer" onClick={() => { navigate('/admin/course') }}>강좌·강의</MenubarItem>
                            <MenubarItem className="cursor-pointer" onClick={() => { navigate('/admin/users/instructors') }}>강사 관리</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/admin/notice') }}>공지사항</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/test/coding') }}>코딩테스트</MenubarTrigger>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">결제 관리</MenubarTrigger>
                        <MenubarContent>
                            <MenubarGroup>
                                <MenubarItem>강사료 지불</MenubarItem>
                                <MenubarItem>수강생 환불</MenubarItem>
                            </MenubarGroup>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">커뮤니티</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => { navigate('/test/qna') }}>Q&A</MenubarItem>
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

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="text-sm">{users.name}님</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">알람띠링띠링</PopoverContent>
                </Popover>
                <Logout />
            </div>
        </nav>
    );
}

export default AdminNav;
