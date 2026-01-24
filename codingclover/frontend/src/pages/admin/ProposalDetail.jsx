import React, { useState, useEffect } from "react";
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
import axios from "axios";
import { Badge } from "@/components/ui/badge"

function ProposalDetail() {

    const { id } = useParams(); // URL에서 courseId 추출
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get('/admin/course', { withCredentials: true })
            .then((response) => {
                const found = response.data.find(c => c.courseId === Number(id));
                setCourse(found);
            })
            .catch((err) => {
                console.error('데이터 로딩 실패', err);
            })
    }, [id]);

    const handleApprove = () => {
        // 백엔드 CourseController의 @PostMapping("/admin/course/{id}/approve") 호출
        axios.post(`/admin/course/${id}/approve`, {}, { withCredentials: true })
            .then((response) => {
                alert("강좌 승인이 완료되었습니다.");
                navigate("/admin/course"); // 승인 후 목록으로 이동
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

    const handleSubmit = (data) => {
        console.log(data); // 폼 데이터 유효성 검사 통과 후 디비에 저장하고 adminmain으로 돌아가기
        setCourse(prev => ({ ...prev, proposal_status: 'APPROVED' }))
    };

    if (!course) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex max-w-2xl flex-col gap-4 text-sm">
                <div className="flex flex-col gap-1.5">
                    <div className="leading-none font-bold text-lg">강좌명</div>
                    <div className="text-xl">{course.title}</div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-semibold">난이도:</span> {course.level}단계
                    </div>
                    <div>
                        <span className="font-semibold">가격:</span> {course.price?.toLocaleString()}원
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

                <div className="flex gap-3 mt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={course.proposalStatus === 'APPROVED'}>
                                {course.proposalStatus === 'APPROVED' ? "승인 완료됨" : "강좌 승인"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>강좌 개설을 승인하시겠습니까?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>아니오</AlertDialogCancel>
                                <AlertDialogAction onClick={handleApprove}>네, 승인합니다</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="ghost" onClick={() => navigate(-1)}>뒤로 가기</Button>
                </div>
            </div>
        </div>
    );


}

export default ProposalDetail;