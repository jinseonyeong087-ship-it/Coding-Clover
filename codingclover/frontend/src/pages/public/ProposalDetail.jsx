import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { useParams, useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios";
import { Badge } from "@/components/ui/badge"
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarFooter,
    SidebarTrigger,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminPropsalDetail from "@/pages/admin/AdminPropsalDetail"
import StudentCourseDetail from "@/pages/student/StudentCourseDetail"

function ProposalDetail() {

    const [role, setRole] = useState(null);
    const [loginId, setLoginId] = useState(false);

    useEffect(() => {
        const storedLoginId = localStorage.getItem("loginId");
        const storedUsers = localStorage.getItem("users");

        if (storedLoginId === "true") {
            setLoginId(true);
        }

        if (storedUsers) {
            const userData = JSON.parse(storedUsers);
            // ApiLoginSuccess.java에서 "role"이라는 키로 응답을 보내므로 이를 참조합니다.
            setRole(userData.role);
        }
    }, []);

    // 1. 로그인하지 않은 상태일 때 (디폴트)
    // if (!loginId) {
    //     return <StudentNav />;
    // }

    // 2. 로그인 상태일 때 UsersRole에 따른 분기
    // Users.java의 UsersRole 열거형 값(ADMIN, INSTRUCTOR, STUDENT)을 기준으로 합니다.
    switch (role) {
        case 'ADMIN':
            return <AdminPropsalDetail />;
        case 'STUDENT':
            return <StudentCourseDetail />;
        default:
            return <StudentCourseDetail />;
    }

    return (
        <>
            <Nav />
            <div className="py-8" />
            <SidebarProvider className="bg-white z-0">
                <Sidebar dir="rtl" side="left">
                    <div className="py-8" />
                    <SidebarHeader>메뉴바 헤더=강좌이름</SidebarHeader>
                    <SidebarContent>
                        <ScrollArea>
                            <SidebarGroup>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>1강. 이게 메뉴인가</SidebarMenuButton>
                                        <SidebarMenuBadge>
                                            {/* onClick={()=>{navicate("/admin/course/:courseId")}} - 반려 승인*/}
                                            {/* onClick={()=>{navicate("/instructor/course/:courseId")}} - 수정 재심사 제출 임시저장(강좌, 강의)*/}
                                            {/* onClick={()=>{navicate("/student/course/:courseId")}} - 수강신청 버튼 남기기&접근권한*/}
                                            <span style={{ backgroundColor: "#4a6fa5", width: "18px", height: "18px", display: "inline-block", borderRadius: "50%" }} />
                                        </SidebarMenuBadge>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>2강. 이 구조로 강사, 관리자, 학생</SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>3강. 강좌 강의 페이지 통일시키기</SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>4강. 대신 버튼은 다르게</SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        </ScrollArea>
                    </SidebarContent>
                    <SidebarFooter>여기에 코딩테스트 넣는 거 어떨까요</SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <div className="flex items-center gap-2 px-4 py-2">
                        <SidebarTrigger />
                    </div>
                    {/* 관리자용 */}
                    <AdminPropsalDetail />

                    {/* 학생용 */}
                    <StudentCourseDetail />

                    <Tail />
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default ProposalDetail;