import React from 'react';
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

function InstructorNav() {
    return (
        <nav className="container mx-auto flex items-center justify-between py-3 border-b bg-background">
            <div className="flex items-center gap-6">
                <Link to="/" className="text-xl font-bold text-primary no-underline">
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
                        <MenubarTrigger className="cursor-pointer">과제 관리</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>내가 올린 과제</MenubarItem>
                            <MenubarItem>과제 등록하기</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">Q&A 답변관리</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>수강생 질문</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="cursor-pointer">수익 정산</MenubarTrigger>
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
                    />
                </div>
                <Button variant="ghost" size="sm"><Link to="/instructor/dashboard">강사 페이이지</Link></Button>
                <Button size="sm"><Link to="/auth/register">로그아웃</Link></Button>
                {/* 로그인 로그아웃 구현해야 함 */}
            </div>
        </nav >
    );
}

export default InstructorNav;
