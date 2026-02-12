import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    ChevronLeft,
    PlayCircle,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight
} from 'lucide-react';

const toEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("/embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/))([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

function AdminLectureDetail() {
    const { courseId: courseIdParam, lectureId: lectureIdParam } = useParams();
    const [courseId, setCourseId] = useState(courseIdParam || null);
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState({ title: "", description: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lectureIdParam) return;

        const found = lectureList.find(l => String(l.lectureId) === lectureIdParam);
        if (found) {
            setSelectedLecture(found);
            return;
        }

        fetch(`/admin/lectures/${lectureIdParam}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                if (!courseId) setCourseId(data.courseId);
                setSelectedLecture(data);
            })
            .catch(err => console.error('강의 조회 실패:', err));
    }, [lectureIdParam, lectureList]);

    useEffect(() => {
        if (courseIdParam) {
            setCourseId(courseIdParam);
        }
    }, [courseIdParam]);

    const fetchLectures = () => {
        if (!courseId) return;
        setLoading(true);
        fetch(`/admin/course/${courseId}/lectures`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("강의 목록 조회 실패");
                return res.json();
            })
            .then((data) => {
                setLectureList(data);
                if (data.length > 0 && !selectedLecture && !lectureIdParam) {
                    setSelectedLecture(data[0]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("강의 목록 조회 실패:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLectures();
    }, [courseId]);

    const handleSelectLecture = (lecture) => {
        setSelectedLecture(lecture);
        setShowRejectInput(false);
        setRejectReason("");
    };

    const handleApprove = async () => {
        try {
            const res = await fetch(`/admin/lectures/${selectedLecture.lectureId}/approve`, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                setDialogMessage({ title: "승인 완료", description: "강의가 승인되었습니다." });
                setDialogOpen(true);
                fetchLectures();
                setSelectedLecture((prev) => ({ ...prev, approvalStatus: "APPROVED" }));
            } else {
                const errorText = await res.text();
                setDialogMessage({ title: "승인 실패", description: errorText });
                setDialogOpen(true);
            }
        } catch (err) {
            setDialogMessage({ title: "오류", description: "서버와 통신 중 오류가 발생했습니다." });
            setDialogOpen(true);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setDialogMessage({ title: "반려 사유 필요", description: "반려 사유를 입력해주세요." });
            setDialogOpen(true);
            return;
        }

        try {
            const res = await fetch(`/admin/lectures/${selectedLecture.lectureId}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reason: rejectReason }),
            });
            if (res.ok) {
                setDialogMessage({ title: "반려 완료", description: "강의가 반려되었습니다." });
                setDialogOpen(true);
                setShowRejectInput(false);
                setRejectReason("");
                fetchLectures();
                setSelectedLecture((prev) => ({ ...prev, approvalStatus: "REJECTED", rejectReason }));
            } else {
                const errorText = await res.text();
                setDialogMessage({ title: "반려 실패", description: errorText });
                setDialogOpen(true);
            }
        } catch (err) {
            setDialogMessage({ title: "오류", description: "서버와 통신 중 오류가 발생했습니다." });
            setDialogOpen(true);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold">승인 완료</Badge>;
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-700 border-0 font-bold">반려됨</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-0 font-bold">승인 대기</Badge>;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "-";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec}초`;
    };

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-gray-50 pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <Link to="/admin/lecture" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    강의 목록으로 돌아가기
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">강의 승인 검토</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* 좌측: 강의 목록 */}
                            <div className="lg:col-span-4">
                                <Card className="border-gray-200 shadow-sm sticky top-24">
                                    <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <PlayCircle className="w-4 h-4 text-primary" />
                                            해당 강좌 타 강의 목록
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-[calc(100vh-250px)]">
                                            <div className="p-1">
                                                {lectureList.length > 0 ? (
                                                    lectureList.map((lecture) => (
                                                        <button
                                                            key={lecture.lectureId}
                                                            onClick={() => handleSelectLecture(lecture)}
                                                            className={`w-full group flex items-start gap-3 p-3 text-left rounded-lg transition-all
                                                                ${selectedLecture?.lectureId === lecture.lectureId
                                                                    ? 'bg-primary/5 text-primary'
                                                                    : 'hover:bg-gray-50 text-gray-700'}`}
                                                        >
                                                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border 
                                                                ${selectedLecture?.lectureId === lecture.lectureId
                                                                    ? 'bg-primary text-white border-primary'
                                                                    : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                                                {lecture.orderNo}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-bold truncate mb-1">
                                                                    {lecture.title}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusBadge(lecture.approvalStatus)}
                                                                </div>
                                                            </div>
                                                            {selectedLecture?.lectureId === lecture.lectureId && (
                                                                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-2" />
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-sm text-gray-400">
                                                        등록된 강의가 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                                        승인 {lectureList.filter(l => l.approvalStatus === 'APPROVED').length} /
                                        반려 {lectureList.filter(l => l.approvalStatus === 'REJECTED').length} /
                                        대기 {lectureList.filter(l => l.approvalStatus === 'PENDING').length}
                                    </div>
                                </Card>
                            </div>

                            {/* 우측: 강의 상세 */}
                            <div className="lg:col-span-8 space-y-6">
                                {selectedLecture ? (
                                    <>
                                        {/* 기본 정보 */}
                                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-900 p-1 flex items-center justify-center aspect-video relative group">
                                                {toEmbedUrl(selectedLecture.videoUrl) ? (
                                                    <iframe
                                                        key={selectedLecture.lectureId}
                                                        width="100%"
                                                        height="100%"
                                                        src={toEmbedUrl(selectedLecture.videoUrl)}
                                                        title="강의 영상"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        referrerPolicy="strict-origin-when-cross-origin"
                                                        allowFullScreen
                                                        className="absolute inset-0"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-500 gap-3">
                                                        <Video className="w-12 h-12 opacity-20" />
                                                        <p className="text-sm font-medium">영상을 확인할 수 없습니다.</p>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                                {selectedLecture.orderNo}강
                                                            </span>
                                                            {getStatusBadge(selectedLecture.approvalStatus)}
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-gray-900">{selectedLecture.title}</h2>
                                                    </div>
                                                    <div className="text-right flex flex-col gap-1 items-end">
                                                        <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                                            {formatDuration(selectedLecture.duration)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator className="my-6 opacity-50" />

                                                <div className="space-y-4">
                                                    <div className="text-sm">
                                                        <span className="text-gray-400 font-bold mr-4 uppercase tracking-tighter text-[10px]">원본 URL</span>
                                                        <span className="text-gray-600 break-all font-mono">{selectedLecture.videoUrl || "-"}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 반려 사유 섹션 */}
                                        {selectedLecture.approvalStatus === "REJECTED" && selectedLecture.rejectReason && (
                                            <Card className="border-red-100 bg-red-50/30 overflow-hidden shadow-sm">
                                                <div className="p-5 flex gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-red-800 mb-1">반려 사유</h3>
                                                        <p className="text-sm text-red-700 leading-relaxed">{selectedLecture.rejectReason}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}

                                        {/* 관리 도구 */}
                                        {selectedLecture.approvalStatus === "PENDING" && (
                                            <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
                                                <CardHeader className="py-4 border-b border-gray-100">
                                                    <CardTitle className="text-sm font-bold">승인 관리</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    {!showRejectInput ? (
                                                        <div className="flex gap-3">
                                                            <Button
                                                                className="flex-1 h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-emerald-200"
                                                                onClick={handleApprove}
                                                            >
                                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                                                강의 승인하기
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-12 text-base font-bold text-red-600 border-red-100 hover:bg-red-50"
                                                                onClick={() => setShowRejectInput(true)}
                                                            >
                                                                <XCircle className="w-5 h-5 mr-2" />
                                                                강의 반려하기
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-gray-400">반려 사유 입력</label>
                                                                <textarea
                                                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50"
                                                                    rows={4}
                                                                    placeholder="강사에게 전달할 상세 반려 사유를 입력해주세요..."
                                                                    value={rejectReason}
                                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    className="flex-1 bg-red-600 hover:bg-red-700 h-11 font-bold"
                                                                    onClick={handleReject}
                                                                >
                                                                    반려 확정
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="flex-1 h-11 text-gray-500 font-bold"
                                                                    onClick={() => {
                                                                        setShowRejectInput(false);
                                                                        setRejectReason("");
                                                                    }}
                                                                >
                                                                    취소
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-200 border-dashed">
                                        <PlayCircle className="w-16 h-16 opacity-10 mb-4" />
                                        <p className="font-medium">좌측 목록에서 강의를 선택하여 검토를 시작하세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogMessage.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialogMessage.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setDialogOpen(false)}>확인</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Tail />
        </>
    );
}

export default AdminLectureDetail;
