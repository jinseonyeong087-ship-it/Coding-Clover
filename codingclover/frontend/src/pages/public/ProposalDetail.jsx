import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { useParams } from "react-router-dom";
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
    SidebarMenuButton
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminPropsalDetail from "@/pages/admin/AdminPropsalDetail"
import StudentCourseDetail from "@/pages/student/StudentCourseDetail"

function ProposalDetail() {
    const { courseId } = useParams();
    const [role, setRole] = useState(null);
    const [roleLoaded, setRoleLoaded] = useState(false);
    const [courseInfo, setCourseInfo] = useState(null);
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);

    useEffect(() => {
        const storedUsers = localStorage.getItem("users");
        if (storedUsers) {
            const userData = JSON.parse(storedUsers);
            setRole(userData.role);
        }
        setRoleLoaded(true);
    }, []);

    // 역할별 API 엔드포인트
    const getCourseUrl = () => {
        switch (role) {
            case 'ADMIN': return `/admin/course/${courseId}`;
            default: return `/course/${courseId}`;
        }
    };

    const getLectureListUrl = () => {
        switch (role) {
            case 'ADMIN': return `/admin/course/${courseId}/lectures`;
            default: return `/student/lecture/${courseId}/lecture`;
        }
    };

    // 강좌 정보 가져오기 (role 확정 후)
    useEffect(() => {
        if (!roleLoaded) return;
        fetch(getCourseUrl(), {
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
    }, [courseId, roleLoaded]);

    // 강의 목록 가져오기 (role 확정 후)
    useEffect(() => {
        if (!roleLoaded) return;
        fetch(getLectureListUrl(), {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch(err => console.error('강의 목록 조회 실패:', err));
    }, [courseId, roleLoaded]);

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

    // 역할별 메인 콘텐츠 렌더링
    const renderContent = () => {
        // 1. 영상이 선택되었다면 역할과 상관없이 영상 플레이어를 먼저 보여줌
        if (selectedLecture) {
            return (
                <div className="p-6">
                    <LectureDetail selectedLecture={selectedLecture} />
                </div>
            );
        }

        // 2. 영상이 선택되지 않았을 때 기존 상세 페이지 노출
        if (role === 'ADMIN') {
            return <AdminPropsalDetail courseId={courseId} />;
        } else {
            return <StudentCourseDetail courseId={courseId} />;
        }
    };

    return (
        <>
            <Nav />
            <div className="py-8" />
            <SidebarProvider className="bg-white">
                <Sidebar dir="rtl" side="left" className="!top-16 !h-[calc(100svh-4rem)]">
                    <SidebarHeader>{courseInfo ? courseInfo.title : '강좌명'}</SidebarHeader>
                    <SidebarContent>
                        <ScrollArea>
                            <SidebarGroup>
                                <SidebarMenu>
                                    {lectureList.length > 0 ? (
                                        lectureList.map((lecture) => (
                                            <SidebarMenuItem key={lecture.lectureId}>
                                                <SidebarMenuButton onClick={() => setSelectedLecture(lecture)} // 클릭 시 강의 선택
                                                    isActive={selectedLecture?.lectureId === lecture.lectureId}>
                                                    <span>{lecture.orderNo}강. {lecture.title}</span>
                                                    {getStatusBadge(lecture.approvalStatus)}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))
                                    ) : (
                                        <SidebarMenuItem>
                                            <p>등록된 강의가 없습니다</p>
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
                    {renderContent()}
                    <Tail />
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default ProposalDetail;
