import React, { useState } from 'react';
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

function StudentNav() {

    return (
        <nav className="flex items-center justify-between px-24 py-3 border-b bg-background">
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
                                <MenubarItem><Link to="/course/level/1">초급</Link></MenubarItem>
                                <MenubarItem><Link to="/course/level/2">중급</Link></MenubarItem>
                                <MenubarItem><Link to="/course/level/3">고급</Link></MenubarItem>
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
                            <MenubarItem>Q&A</MenubarItem>
                            <MenubarItem>자유게시판</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">마이페이지</MenubarTrigger>
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
                    />
                </div>
                <Button variant="ghost" size="sm"><Link to="/auth/login">로그인</Link></Button>
                <Button size="sm"><Link to="/auth/register">회원가입</Link></Button>
            </div>
        </nav>
    );
}

export default StudentNav;
