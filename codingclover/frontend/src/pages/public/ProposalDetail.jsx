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
    if (!loginId) {
        return <StudentNav />;
    }

    // 2. 로그인 상태일 때 UsersRole에 따른 분기
    // Users.java의 UsersRole 열거형 값(ADMIN, INSTRUCTOR, STUDENT)을 기준으로 합니다.
    switch (role) {
        case 'ADMIN':
            return <AdminPropsalDetail />;
        case 'INSTRUCTOR':
            return <IstructorPropsalDetail />;
        case 'STUDENT':
            return <StudentCourseDetail />;
        default:
            // 역할 정보가 없거나 일치하지 않을 경우 기본 학생용 Nav 표시
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
                    <AdminPropsalDetail />
                    {/* <IstructorPropsalDetail /> */}
                    {/* <StudentCourseDetail /> */}

                    {/* 관리자 용 */}
                    {/* <section className="container mx-auto px-16 py-16">
                        <div className="flex max-w-2xl flex-col gap-4 text-sm">
                            <div className="flex flex-col gap-1.5">
                                <div className="leading-none font-bold text-lg">강좌명</div>
                                <div className="text-xl">{course.title}</div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <span className="font-semibold">난이도:</span> {getLevelText(course.level)}
                                </div>
                                <div>
                                    <span className="font-semibold">가격:</span> {course.price?.toLocaleString()}원
                                </div>
                                <div>
                                    <span className="font-semibold">강사명:</span> {course.instructorName}
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="font-semibold mb-1">강좌 설명</div>
                                <div className="bg-slate-50 p-4 rounded-md border">
                                    {course.description}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <span className="font-semibold">현재 상태:</span>
                                {course.proposalStatus === 'PENDING' ? (
                                    <Badge variant="destructive">승인 대기</Badge>
                                ) : course.proposalStatus === 'APPROVED' ? (
                                    <Badge variant="secondary">승인 완료</Badge>
                                ) : (
                                    <Badge variant="outline">반려됨</Badge>
                                )}
                            </div>

                            {course.proposalStatus === 'REJECTED' && course.proposalRejectReason && (
                                <div className="mt-4">
                                    <div className="font-semibold mb-1 text-red-600">반려 사유</div>
                                    <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                                        {course.proposalRejectReason}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button disabled={course.proposalStatus !== 'PENDING'}>
                                            {course.proposalStatus === 'APPROVED' ? "승인 완료됨" :
                                                course.proposalStatus === 'REJECTED' ? "반려됨" : "강좌 승인"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>강좌 개설을 승인하시겠습니까?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                승인 후, 강사님들이 강의를 업로드할 수 있습니다.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>아니오</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleApprove}>네, 승인합니다</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={course.proposalStatus !== 'PENDING'}>
                                            강좌 반려
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>강좌 개설을 반려하시겠습니까?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <Textarea
                                            placeholder="반려 사유를 입력하세요."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setRejectReason("")}>취소</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleReject}>반려하기</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <Button variant="ghost" onClick={() => navigate(-1)}>뒤로 가기</Button>
                            </div>
                        </div>
                    </section> */}
                    {/* 학생용 */}
                    <section className="container mx-auto px-16 py-16">



                        
                    </section>
                    {/* 강사용 */}
                    <section className="container mx-auto px-16 py-16">


                    </section>

                    <Tail />
                </SidebarInset>
            </SidebarProvider>


        </>

    );


}

export default ProposalDetail;