import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

// YouTube URL -> embed URL 변환
const toEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    // youtu.be 형식 처리
    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url.replace("watch?v=", "embed/");
};

function AdminLectureDetail() {
    const { courseId } = useParams();
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState({ title: "", description: "" });

    // 강의 목록 가져오기
    const fetchLectures = () => {
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
                // 첫 번째 강의 자동 선택
                if (data.length > 0 && !selectedLecture) {
                    setSelectedLecture(data[0]);
                }
            })
            .catch((err) => console.error("강의 목록 조회 실패:", err));
    };

    useEffect(() => {
        fetchLectures();
    }, [courseId]);

    // 강의 선택
    const handleSelectLecture = (lecture) => {
        setSelectedLecture(lecture);
        setShowRejectInput(false);
        setRejectReason("");
    };

    // 승인 처리
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
                // 승인 후 선택된 강의 상태 갱신
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

    // 반려 처리
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

    // 승인 상태 뱃지
    const getStatusBadge = (status) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="secondary">승인</Badge>;
            case "REJECTED":
                return <Badge variant="outline">반려</Badge>;
            default:
                return <Badge variant="destructive">대기</Badge>;
        }
    };

    // 재생 시간 포맷
    const formatDuration = (seconds) => {
        if (!seconds) return "-";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec}초`;
    };

    const approvedCount = lectureList.filter((l) => l.approvalStatus === "APPROVED").length;
    const rejectedCount = lectureList.filter((l) => l.approvalStatus === "REJECTED").length;
    const pendingCount = lectureList.filter((l) => l.approvalStatus !== "APPROVED" && l.approvalStatus !== "REJECTED").length;

    return (
        <>
            <Nav />
            <div className="py-8" />
            <SidebarProvider className="bg-white">
                <Sidebar side="left" className="!top-16 !h-[calc(100svh-4rem)]">
                    <SidebarHeader className="px-4 py-3 font-semibold">강의 목록</SidebarHeader>
                    <SidebarContent>
                        <ScrollArea>
                            <SidebarGroup>
                                <SidebarMenu>
                                    {lectureList.length > 0 ? (
                                        lectureList.map((lecture) => (
                                            <SidebarMenuItem key={lecture.lectureId}>
                                                <SidebarMenuButton
                                                    onClick={() => handleSelectLecture(lecture)}
                                                    className={selectedLecture?.lectureId === lecture.lectureId ? "bg-accent" : ""}
                                                >
                                                    <span>{lecture.orderNo}강. {lecture.title}</span>
                                                    {getStatusBadge(lecture.approvalStatus)}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))
                                    ) : (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton>등록된 강의가 없습니다</SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                                </SidebarMenu>
                            </SidebarGroup>
                        </ScrollArea>
                        <SidebarFooter className="px-4 py-3 text-sm text-muted-foreground">
                            승인 {approvedCount}개 / 반려 {rejectedCount}개 / 대기 {pendingCount}개
                        </SidebarFooter>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset>
                    <div className="flex items-center gap-2 px-4 py-2">
                        <SidebarTrigger />
                        <span className="text-sm text-muted-foreground">강의 상세 및 영상 확인</span>
                    </div>

                    <section className="container mx-auto px-8 py-4">
                        {selectedLecture ? (
                            <div className="flex flex-col gap-6 max-w-4xl">
                                {/* 강의 정보 */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold">
                                            {selectedLecture.orderNo}강. {selectedLecture.title}
                                        </h2>
                                        {getStatusBadge(selectedLecture.approvalStatus)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        재생 시간: {formatDuration(selectedLecture.duration)}
                                    </div>
                                </div>

                                <Separator />

                                {/* 영상 미리보기 */}
                                <div>
                                    <h3 className="font-semibold mb-3">영상 미리보기</h3>
                                    {selectedLecture.videoUrl ? (
                                        <iframe
                                            width="100%"
                                            height="500"
                                            src={toEmbedUrl(selectedLecture.videoUrl)}
                                            title="강의 영상"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="bg-slate-100 rounded-md flex items-center justify-center h-64 text-muted-foreground">
                                            영상 URL이 없습니다
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-muted-foreground break-all">
                                        원본 URL: {selectedLecture.videoUrl || "-"}
                                    </div>
                                </div>

                                <Separator />

                                {/* 반려 사유 표시 (반려된 경우) */}
                                {selectedLecture.approvalStatus === "REJECTED" && selectedLecture.rejectReason && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <p className="text-sm font-semibold text-red-800 mb-1">반려 사유</p>
                                        <p className="text-sm text-red-700">{selectedLecture.rejectReason}</p>
                                    </div>
                                )}

                                {/* 승인/반려 버튼 (PENDING 상태일 때만) */}
                                {selectedLecture.approvalStatus === "PENDING" && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-3">
                                            <Button onClick={handleApprove}>승인</Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowRejectInput(!showRejectInput)}
                                            >
                                                반려
                                            </Button>
                                        </div>
                                        {showRejectInput && (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    className="w-full border rounded-md p-3 text-sm resize-none"
                                                    rows={3}
                                                    placeholder="반려 사유를 입력해주세요"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <Button variant="destructive" onClick={handleReject}>
                                                        반려 확정
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
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
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                좌측 목록에서 강의를 선택해주세요
                            </div>
                        )}
                    </section>

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
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default AdminLectureDetail;
