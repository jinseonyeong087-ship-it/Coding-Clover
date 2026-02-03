// 수강생 수강신청 & 강좌 & 강의 페이지
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function StudentCourseDetail() {

    const { courseId } = useParams();
    const [course, setCourse] = useState([]);
    const [enrollment, setEnrollment] = useState([]);
    const navigate = useNavigate();

    // 강좌 정보 가져오기
    useEffect(() => {
        fetch(`/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error(`에러 발생: ${res.status}`);
                return res.json();
            })
            .then((data) => setCourse(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);


    const handleSubmit = async () => {
        const enrollData = [];
        await fetch(``, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify
        })
    }

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    const getEnrollState = (state) => {

        switch (state) {
            case 'ENROLLED':
                return { text: '수강 중', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
            case 'COMPLETED':
                return { text: '수강 완료', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
            case 'CANCELLED':
                return { text: '수강 취소', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
            default:
                return { text: '수강 신청', icon: FileText, color: 'text-gray-600', style: { backgroundColor: "#4a6fa5" } };
        }
    }

    return (
        <>
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

                    <div className="flex gap-3 mt-6">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                {enrollment.proposalStatus === 'ENROLLED' ? (<Button>수강 중</Button>)
                                    : enrollment.proposalStatus === 'COMPLETED' ? (<Button>수강 완료</Button>)
                                        : enrollment.proposalStatus === 'CANCELLED' ? (<Button>수강 취소</Button>)
                                            : (<Button>수강 신청</Button>)}

                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>수강신청이 완료되었습니다.</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        신청내역은 마이페이지에서 볼 수 있습니다.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction>확인</AlertDialogAction>
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

export default StudentCourseDetail;