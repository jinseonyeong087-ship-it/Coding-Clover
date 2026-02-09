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
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import LectureCreate from "./LectureCreate";
import InstructorLecture from "./InstructorLecture";
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
                return <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px' }}>승인</span>;
            case 'REJECTED':
                return <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>반려</span>;
            default:
                return <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#fef9c3', color: '#854d0e', borderRadius: '4px' }}>대기</span>;
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
            <SidebarProvider className="bg-white">
                <Sidebar dir="rtl" side="left" className="!top-16 !h-[calc(100svh-4rem)]">
                    <SidebarHeader
                        onClick={() => navigate(`/instructor/course/${courseId}`)}
                        className="cursor-pointer hover:bg-accent"
                    >
                        강의 업로드 {courseInfo ? courseInfo.title : '강좌명'}
                    </SidebarHeader>
                    <SidebarContent>
                        <ScrollArea>
                            <SidebarGroup>
                                <SidebarMenu>
                                    {lectureList.length > 0 ? (
                                        lectureList.map((lecture) => (
                                            <SidebarMenuItem key={lecture.lectureId}>
                                                <SidebarMenuButton onClick={() => navigate(`/instructor/lecture/${lecture.lectureId}`)}>
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
                        <SidebarFooter>
                            승인 {approvedCount}개 / 반려 {rejectedCount}개 / 대기 {pendingCount}개
                        </SidebarFooter>
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    <div className="flex items-center gap-2 px-4 py-2">
                        <SidebarTrigger />
                    </div>
                    <section className="container mx-auto px-16 py-24">
                    {selectedLecture ? (
                        /* 강의 상세 */
                        <LectureDetail lecture={selectedLecture} onLectureUpdated={fetchLectures} />
                    ) : (
                        <>
                            {/* 강좌 소개 */}
                            <LectureCreate />
                            {/* 강의 업로드 */}
                            {/* <InstructorLecture /> */}
                        </>
                    )}
                    </section>
                    <Tail />
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default InstructorCourseDetail;