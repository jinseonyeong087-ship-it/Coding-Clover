import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
    MonitorPlay, User, FileText, ChevronLeft, Clock, AlertCircle
} from "lucide-react";
import axios from 'axios';

function AdminPropsalDetail() {

    const { courseId } = useParams(); // URL에서 courseId 추출
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [rejectReason, setRejectReason] = useState(""); // 반려 사유
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false); // 반려 다이얼로그 상태
    const [lectureList, setLectureList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [batchRejectReason, setBatchRejectReason] = useState("");
    const [isBatchRejectDialogOpen, setIsBatchRejectDialogOpen] = useState(false);

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

    // 강의 목록 가져오기
    const fetchLectures = () => {
        fetch(`/admin/course/${courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch((err) => console.error('강의 목록 조회 실패:', err));
    };

    useEffect(() => {
        fetchLectures();
    }, [courseId]);

    // 강좌 승인하기
    const handleApprove = () => {
        // 백엔드 CourseController의 @PostMapping("/admin/course/{id}/approve") 호출
        axios.post(`/admin/course/${courseId}/approve`, { withCredentials: true })
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

    // 체크박스 선택/해제
    const handleCheck = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 강의 일괄 승인
    const handleBatchApprove = async () => {
        if (selectedIds.length === 0) return alert("승인할 강의를 선택하세요.");
        try {
            const response = await axios.post('/admin/lectures/batch-approve', {
                lectureIds: selectedIds
            });
            alert(response.data);
            setSelectedIds([]);
            fetchLectures();
        } catch (error) {
            alert("승인 처리 중 오류 발생");
        }
    };

    // 강의 일괄 반려
    const handleBatchReject = async () => {
        if (selectedIds.length === 0) return alert("반려할 강의를 선택하세요.");
        if (!batchRejectReason.trim()) {
            alert("반려 사유를 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post('/admin/lectures/batch-reject', {
                lectureIds: selectedIds,
                rejectReason: batchRejectReason
            });
            alert(response.data);
            setSelectedIds([]);
            setBatchRejectReason("");
            setIsBatchRejectDialogOpen(false);
            fetchLectures();
        } catch (error) {
            alert("반려 처리 중 오류 발생");
        }
    };

    const getLevelBadge = (level) => {
        const levels = { 1: "초급", 2: "중급", 3: "고급" };
        const colors = {
            1: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            2: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            3: "bg-rose-500/10 text-rose-500 border-rose-500/20"
        };
        const numLevel = typeof level === 'string' ? (level === "초급" ? 1 : level === "중급" ? 2 : 3) : level;
        return (
            <Badge variant="outline" className={`border ${colors[numLevel] || "bg-secondary text-secondary-foreground"}`}>
                {levels[numLevel] || level}
            </Badge>
        );
    };

    if (!course) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                            <div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    이전 목록으로 돌아가기
                                </button>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    강좌 개설 심사
                                </h1>
                                <p className="text-gray-500">
                                    강사가 신청한 강좌의 상세 정보와 강의 구성을 검토합니다.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 좌측: 강좌 정보 */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-8 space-y-6">
                                        <div className="flex flex-wrap gap-2">
                                            {getLevelBadge(course.level)}
                                            {course.proposalStatus === 'PENDING' ? (
                                                <Badge className="bg-amber-100 text-amber-700 border-0">승인 대기</Badge>
                                            ) : course.proposalStatus === 'APPROVED' ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0">승인 완료</Badge>
                                            ) : (
                                                <Badge className="bg-rose-100 text-rose-700 border-0">반려됨</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                                {course.title}
                                            </h2>
                                            <p className="text-gray-600 text-lg leading-relaxed">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                    <User className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">강사명</div>
                                                    <div className="font-bold text-gray-900">{course.instructorName}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                    <FileText className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">수강료</div>
                                                    <div className="font-bold text-gray-900">{course.price?.toLocaleString()} P</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* 반려 사유 표시 */}
                                {course.proposalStatus === 'REJECTED' && course.proposalRejectReason && (
                                    <Card className="bg-rose-50/50 border-rose-100 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
                                                <AlertCircle className="w-5 h-5" />
                                                반려 사유
                                            </div>
                                            <p className="text-rose-600 leading-relaxed bg-white/50 p-4 rounded-lg border border-rose-100">
                                                {course.proposalRejectReason}
                                            </p>
                                        </div>
                                    </Card>
                                )}

                                {/* 강의 목록 */}
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <MonitorPlay className="w-5 h-5 text-primary" />
                                            강의 구성 목록
                                            <span className="text-xs font-normal text-gray-400 ml-1">({lectureList.length}개 강의)</span>
                                        </h3>
                                    </div>
                                    <div className="p-2">
                                        {lectureList.length > 0 ? (
                                            <div className="space-y-1">
                                                {lectureList.map((lecture, index) => (
                                                    <div
                                                        key={lecture.lectureId}
                                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <Checkbox
                                                                checked={selectedIds.includes(lecture.lectureId)}
                                                                onCheckedChange={() => handleCheck(lecture.lectureId)}
                                                                className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <button
                                                                onClick={() => navigate(`/admin/lectures/${lecture.lectureId}`)}
                                                                className="text-left"
                                                            >
                                                                <div className="text-xs text-gray-400 mb-0.5">{index + 1}강</div>
                                                                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                                    {lecture.title}
                                                                </div>
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {lecture.approvalStatus && (
                                                                <Badge className={`border-0 font-medium ${lecture.approvalStatus === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                                                        lecture.approvalStatus === 'REJECTED' ? "bg-rose-100 text-rose-700" :
                                                                            "bg-amber-100 text-amber-700"
                                                                    }`}>
                                                                    {lecture.approvalStatus === 'APPROVED' ? '승인' :
                                                                        lecture.approvalStatus === 'REJECTED' ? '반려' : '대기'}
                                                                </Badge>
                                                            )}
                                                            {lecture.duration && (
                                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDuration(lecture.duration)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center text-gray-400 text-sm">
                                                등록된 강의 정보가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* 우측: 썸네일 및 액션 패널 */}
                            <div className="space-y-6">
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden sticky top-24">
                                    <div className="aspect-video bg-gray-100 relative group">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-gray-300">
                                                <MonitorPlay className="w-16 h-16 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/10" />
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {selectedIds.length > 0 && (
                                            <div className="p-3 bg-blue-50 rounded-lg text-center text-[11px] font-bold text-blue-600 border border-blue-100">
                                                선택된 강의: {selectedIds.length}개
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="default"
                                                className="font-bold h-11"
                                                disabled={selectedIds.length === 0}
                                                onClick={handleBatchApprove}
                                            >
                                                일괄 승인
                                            </Button>

                                            <AlertDialog open={isBatchRejectDialogOpen} onOpenChange={setIsBatchRejectDialogOpen}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="font-bold border-gray-200 text-gray-600 hover:bg-gray-50 h-11"
                                                        disabled={selectedIds.length === 0}
                                                    >
                                                        일괄 반려
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white border-gray-200">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="font-bold text-gray-900">
                                                            {selectedIds.length}개 강의 일괄 반려
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-500">
                                                            선택한 강의들의 반려 사유를 입력해주세요.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <Textarea
                                                        placeholder="반려 사유를 입력하세요."
                                                        value={batchRejectReason}
                                                        onChange={(e) => setBatchRejectReason(e.target.value)}
                                                        className="min-h-[120px] bg-gray-50 border-gray-200 focus:ring-primary mt-4"
                                                    />
                                                    <AlertDialogFooter className="mt-6">
                                                        <AlertDialogCancel
                                                            onClick={() => setBatchRejectReason("")}
                                                            className="border-gray-200 text-gray-600"
                                                        >
                                                            취소
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleBatchReject}
                                                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
                                                        >
                                                            반려 처리
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>

                                        <Separator className="bg-gray-100" />

                                        <div className="space-y-3">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="lg"
                                                        className="w-full font-bold h-12 text-white bg-slate-900 hover:bg-slate-800"
                                                        disabled={course.proposalStatus !== 'PENDING'}
                                                    >
                                                        {course.proposalStatus === 'APPROVED' ? "심사 완료" : "강좌 개설 승인"}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white border-gray-200">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="font-bold text-gray-900">강좌 개설을 승인하시겠습니까?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-500">
                                                            승인 완료 시 해당 강좌는 학생들의 검색 결과에 나타나며 수강 신청이 가능해집니다.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-6">
                                                        <AlertDialogCancel className="border-gray-200 text-gray-600">아니오</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleApprove}
                                                            className="bg-primary hover:bg-primary/90 text-white font-bold"
                                                        >
                                                            승인 확정
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="lg"
                                                        variant="ghost"
                                                        className="w-full font-bold h-12 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                        disabled={course.proposalStatus !== 'PENDING'}
                                                    >
                                                        강좌 개설 반려
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white border-gray-200">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="font-bold text-gray-900">강좌 개설 반려</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-500">
                                                            강사에게 전달될 반려 사유를 상세히 입력해주세요.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <Textarea
                                                        placeholder="예: 강좌 설명이 부족하거나 강의 영상 품질이 기준에 미달합니다."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        className="min-h-[150px] bg-gray-50 border-gray-200 focus:ring-primary mt-4"
                                                    />
                                                    <AlertDialogFooter className="mt-6">
                                                        <AlertDialogCancel
                                                            onClick={() => setRejectReason("")}
                                                            className="border-gray-200 text-gray-600"
                                                        >
                                                            취소
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleReject}
                                                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
                                                        >
                                                            반려 확정
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <Tail />
        </>
    )

}

const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default AdminPropsalDetail;