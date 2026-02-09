import React, { useState, useEffect } from "react";
import AdminNav from '@/components/AdminNav';
import Tail from "@/components/Tail";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    MonitorPlay, User, FileText, ChevronLeft, Clock
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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <div className="pt-16" />
            <AdminNav />
            <main className="container mx-auto px-6 py-12 max-w-5xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 hover:bg-muted/50 -ml-4">
                    <ChevronLeft className="w-4 h-4 mr-2" /> 목록으로 돌아가기
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Course Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {getLevelBadge(course.level)}
                                {course.proposalStatus === 'PENDING' ? (
                                    <Badge variant="destructive">승인 대기</Badge>
                                ) : course.proposalStatus === 'APPROVED' ? (
                                    <Badge variant="secondary">승인 완료</Badge>
                                ) : (
                                    <Badge variant="outline">반려됨</Badge>
                                )}
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">{course.title}</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {course.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-6 py-6 border-y border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">Instructor</div>
                                    <div className="font-bold">{course.instructorName}</div>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-border/50" />
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">Price</div>
                                    <div className="font-bold">{course.price?.toLocaleString()}원</div>
                                </div>
                            </div>
                        </div>

                        {/* 반려 사유 표시 (반려된 경우에만) */}
                        {course.proposalStatus === 'REJECTED' && course.proposalRejectReason && (
                            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                                <h3 className="text-xl font-bold mb-4 text-red-600">반려 사유</h3>
                                <p className="text-red-800">{course.proposalRejectReason}</p>
                            </div>
                        )}

                        {/* 강의 목록 */}
                        <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5 text-primary" />
                                강의 목록
                                <span className="text-sm font-normal text-muted-foreground">({lectureList.length}강)</span>
                            </h3>
                            <div className="space-y-3">
                                {lectureList.length > 0 ? (
                                    lectureList.map((lecture, index) => (
                                        <div
                                            key={lecture.lectureId}
                                            className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedIds.includes(lecture.lectureId)}
                                                    onCheckedChange={() => handleCheck(lecture.lectureId)}
                                                />
                                                <span
                                                    className="cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => navigate(`/admin/lectures/${lecture.lectureId}`)}
                                                >
                                                    {index + 1}강. {lecture.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {lecture.approvalStatus && (
                                                    <Badge variant="outline" className={
                                                        lecture.approvalStatus === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        lecture.approvalStatus === 'REJECTED' ? "bg-red-50 text-red-700 border-red-200" :
                                                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    }>
                                                        {lecture.approvalStatus === 'APPROVED' ? '승인' :
                                                         lecture.approvalStatus === 'REJECTED' ? '반려' : '대기'}
                                                    </Badge>
                                                )}
                                                {lecture.duration && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatDuration(lecture.duration)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground pt-2">
                                        등록된 강의가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden">
                            <div className="bg-muted/50 p-6 flex items-center justify-center">
                                <MonitorPlay className="w-20 h-20 text-muted-foreground/30" />
                            </div>
                            <div className="p-6 space-y-6">
                                {selectedIds.length > 0 && (
                                    <div className="text-sm text-muted-foreground text-center">
                                        {selectedIds.length}개 강의 선택됨
                                    </div>
                                )}
                                <div className="flex flex-col gap-3">
                                    {/* 강의 일괄 승인 */}
                                    <Button
                                        size="lg"
                                        variant={selectedIds.length === 0 ? "ghost" : "default"}
                                        className="w-full font-bold"
                                        disabled={selectedIds.length === 0}
                                        onClick={handleBatchApprove}
                                    >
                                        선택 일괄 승인
                                    </Button>
                                    {/* 강의 일괄 반려 */}
                                    <AlertDialog open={isBatchRejectDialogOpen} onOpenChange={setIsBatchRejectDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="lg"
                                                variant={selectedIds.length === 0 ? "ghost" : "destructive"}
                                                className="w-full font-bold"
                                                disabled={selectedIds.length === 0}
                                            >
                                                선택 일괄 반려
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{selectedIds.length}개 강의를 반려하시겠습니까?</AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <Textarea
                                                placeholder="반려 사유를 입력하세요."
                                                value={batchRejectReason}
                                                onChange={(e) => setBatchRejectReason(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setBatchRejectReason("")}>취소</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleBatchReject}>반려하기</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* 승인 다이얼로그 */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="lg" className="w-full font-bold" variant={course.proposalStatus !== 'PENDING' ? "ghost" : "default"} disabled={course.proposalStatus !== 'PENDING'}>
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
                                            <Button size="lg" variant={course.proposalStatus !== 'PENDING' ? "ghost" : "destructive"} className="w-full font-bold" disabled={course.proposalStatus !== 'PENDING'}>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Tail />
        </div>
    )

}

const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default AdminPropsalDetail;