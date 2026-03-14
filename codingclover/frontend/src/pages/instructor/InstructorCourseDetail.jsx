import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle2, XCircle, Clock, ChevronLeft, Video } from "lucide-react";
import LectureCreate from "./LectureCreate";
import LectureDetail from "./LectureDetail";

function InstructorCourseDetail() {
    const { courseId: courseIdParam, lectureId: lectureIdParam } = useParams();
    const [courseId, setCourseId] = useState(courseIdParam || null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const navigate = useNavigate();

    // courseId 경로로 접근한 경우: 강의 선택 해제 + courseId 동기화
    useEffect(() => {
        if (courseIdParam) {
            setCourseId(courseIdParam);
            setSelectedLecture(null);
        }
    }, [courseIdParam]);

    // lectureId로 접근한 경우: 목록에서 찾거나 API로 조회
    useEffect(() => {
        if (!lectureIdParam) return;

        // lectureList가 이미 로드되어 있으면 API 호출 없이 바로 선택
        const found = lectureList.find(l => String(l.lectureId) === lectureIdParam);
        if (found) {
            setSelectedLecture(found);
            return;
        }

        // 최초 진입 시 (목록 미로드) API로 강의 조회 → courseId 획득
        fetch(`/instructor/lecture/${lectureIdParam}`, { credentials: 'include' })
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

    // 강좌 정보 가져오기
    useEffect(() => {
        if (!courseId) return;
        fetch(`/instructor/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error(`에러 발생: ${res.status}`);
                return res.json();
            })
            .then((data) => setCourseInfo(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);

    // 강의 목록 가져오기
    const fetchLectures = () => {
        if (!courseId) return;
        fetch(`/instructor/course/${courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch(err => console.error('강의 목록 조회 실패:', err));
    };

    useEffect(() => {
        fetchLectures();
    }, [courseId]);

    // 승인 상태 뱃지
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">승인</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 border-0 text-[10px] px-1.5 py-0">반려</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">대기</Badge>;
        }
    };

    // 승인 상태별 카운트
    const approvedCount = lectureList.filter(l => l.approvalStatus === 'APPROVED').length;
    const rejectedCount = lectureList.filter(l => l.approvalStatus === 'REJECTED').length;
    const pendingCount = lectureList.filter(l => l.approvalStatus !== 'APPROVED' && l.approvalStatus !== 'REJECTED').length;

    return (
        <>
            <Nav />
            <div className="py-8" />
            <SidebarProvider style={{ "--sidebar-width": "20rem" }} className="bg-white">
                <Sidebar dir="rtl" side="left" className="!top-16 !h-[calc(100svh-4rem)] border-r border-gray-100 bg-white">

                    {/* Sidebar Header */}
                    <SidebarHeader className="p-0 border-b border-gray-100">
                        <div
                            onClick={() => navigate(`/instructor/course/${courseId}`)}
                            className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                    <Video className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">강의 관리</p>
                                    <p className="text-sm font-bold text-gray-800 truncate leading-tight">
                                        {courseInfo ? courseInfo.title : '강좌명'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <ScrollArea className="flex-1">
                            <SidebarGroup className="p-2">
                                <SidebarMenu className="space-y-0.5">
                                    {lectureList.length > 0 ? (
                                        lectureList.map((lecture) => {
                                            const isActive = selectedLecture && String(selectedLecture.lectureId) === String(lecture.lectureId);
                                            const min = Math.floor((lecture.duration || 0) / 60);
                                            const sec = (lecture.duration || 0) % 60;

                                            return (
                                                <SidebarMenuItem key={lecture.lectureId}>
                                                    <div
                                                        onClick={() => navigate(`/instructor/lecture/${lecture.lectureId}`)}
                                                        className={`w-full flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                                                            ${isActive
                                                                ? 'bg-primary/5 border-purple-100 shadow-sm'
                                                                : 'hover:bg-gray-50 border-transparent'
                                                            }`}
                                                    >
                                                        {/* Number Circle */}
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all
                                                            ${isActive
                                                                ? 'bg-primary text-white shadow-sm'
                                                                : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {lecture.orderNo}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex flex-col min-w-0 gap-1.5 flex-1">
                                                            <span className={`text-sm font-bold leading-tight line-clamp-2 transition-colors
                                                                ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                                                                {lecture.orderNo}강. {lecture.title}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-[11px] text-gray-400 font-medium">
                                                                    {min}분 {sec}초
                                                                </span>
                                                                <Separator orientation="vertical" className="h-2 bg-gray-200" />
                                                                {getStatusBadge(lecture.approvalStatus)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SidebarMenuItem>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <BookOpen className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">등록된 강의가 없습니다</p>
                                        </div>
                                    )}
                                </SidebarMenu>
                            </SidebarGroup>
                        </ScrollArea>

                        {/* Sidebar Footer Stats */}
                        <SidebarFooter className="border-t border-gray-100 p-3">
                            <div className="grid grid-cols-3 gap-1.5">
                                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-emerald-50">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[10px] font-bold text-emerald-700">{approvedCount}개</span>
                                    <span className="text-[9px] text-emerald-500 font-medium">승인</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-red-50">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-[10px] font-bold text-red-600">{rejectedCount}개</span>
                                    <span className="text-[9px] text-red-400 font-medium">반려</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-amber-50">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-600">{pendingCount}개</span>
                                    <span className="text-[9px] text-amber-400 font-medium">대기</span>
                                </div>
                            </div>
                        </SidebarFooter>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset className="bg-white">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <SidebarTrigger className="text-gray-400 hover:text-gray-600" />
                    </div>
                    <section className="px-8 py-8 w-full max-w-[1800px] mx-auto">
                        {selectedLecture ? (
                            <LectureDetail lecture={selectedLecture} onLectureUpdated={fetchLectures} />
                        ) : (
                            <LectureCreate />
                        )}
                    </section>
                    <Tail />
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default InstructorCourseDetail;