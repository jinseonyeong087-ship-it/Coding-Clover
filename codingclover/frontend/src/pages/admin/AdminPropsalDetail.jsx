import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import axios from 'axios';

function AdminPropsalDetail() {

    const { courseId } = useParams(); // URL에서 courseId 추출
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [rejectReason, setRejectReason] = useState(""); // 반려 사유
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false); // 반려 다이얼로그 상태

    useEffect(() => {
        fetch(`/admin/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error!: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("응답 데이터:", data);
                setCourse(data);
            })
            .catch((error) => {
                console.error(error.message);
            });
    }, [courseId]);

    // 강좌 승인하기
    const handleApprove = () => {
        // 백엔드 CourseController의 @PostMapping("/admin/course/{id}/approve") 호출
        axios.post(`/admin/course/${courseId}/approve`, { withCredentials: true })
            .then((response) => {
                alert("강좌 승인이 완료되었습니다.");
                navigate("/admin/dashboard"); // 승인 후 목록으로 이동
            })
            .catch((err) => {
                console.error('승인 실패', err);
                if (err.response?.status === 403) {
                    alert("관리자 권한이 없습니다.");
                } else {
                    alert("승인 처리 중 오류가 발생했습니다.");
                }
            });
    };

    // 강사 반려하기
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("반려 사유를 입력해주세요.");
            return;
        }
        try {
            const response = await fetch(`/admin/course/${courseId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: rejectReason })
            });
            if (response.ok) {
                alert("강좌가 반려되었습니다.");
                setIsRejectDialogOpen(false);
                setRejectReason("");
                navigate("/admin/dashboard");
            } else if (response.status === 403) {
                alert("관리자 권한이 없습니다.");
            } else {
                alert("반려 처리 중 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error('반려 실패', err);
            alert("반려 처리 중 오류가 발생했습니다.");
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    if (!course) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <>
            {/* 관리자 용 */}
            <section className="container mx-auto px-16 py-16">
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

                    {/* 반려 사유 표시 (반려된 경우에만) */}
                    {course.proposalStatus === 'REJECTED' && course.proposalRejectReason && (
                        <div className="mt-4">
                            <div className="font-semibold mb-1 text-red-600">반려 사유</div>
                            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                                {course.proposalRejectReason}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        {/* 승인 다이얼로그 */}
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

                        {/* 반려 다이얼로그 */}
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
            </section>
        </>
    )

}

export default AdminPropsalDetail;