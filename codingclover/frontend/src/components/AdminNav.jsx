import React from 'react';
import { Link } from 'react-router-dom';
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

function AdminNav() {
    return (
        <nav className="flex items-center justify-between px-24 py-3 border-b bg-background">
            {/* 로고 + 메뉴바 */}
            <div className="flex items-center gap-6">
                <Link to="/admin/dashboard" className="text-xl font-bold text-primary no-underline">
                    Coding-Clover
                </Link>

                <Menubar className="border-none shadow-none bg-transparent">
                <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer">전체 회원</MenubarTrigger>
                    <MenubarContent>
                        <MenubarGroup>
                            <MenubarItem>강사관리</MenubarItem>
                            <MenubarItem>수상생 관리</MenubarItem>
                        </MenubarGroup>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer">강좌관리</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>승인 대기 강좌</MenubarItem>
                        <MenubarItem>강좌 승인/반려</MenubarItem>
                        <MenubarItem>강의 관리</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer">문제 관리</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>문제 지출</MenubarItem>
                        <MenubarItem>문제 수정/삭제</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger className="cursor-pointer">공지사항</MenubarTrigger>
                </MenubarMenu>
                
                </Menubar>
            </div>

            {/* 검색 & 로그인 */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="메뉴 검색..."
                        className="pl-9 w-48"
                    />
                </div>
                <Button variant="ghost" size="sm"><Link to="/auth/login">로그인</Link></Button>
                <Button size="sm"><Link to="/auth/register">로그아웃</Link></Button>
            </div>
        </nav>
    );
}

export default AdminNav;
