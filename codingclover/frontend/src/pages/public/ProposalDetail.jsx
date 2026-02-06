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
import LectureDetail from "@/pages/student/StudentLectureDetail"

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
            default: return `/student/lecture/${courseId}/lectures`;
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

    // 강의 클릭 핸들러 (비로그인 시 접근 차단)
    const handleLectureClick = (lecture) => {
        if (!role) {
            alert('로그인이 필요합니다.');
            return;
        }
        setSelectedLecture(lecture);
    };

    // 역할별 메인 콘텐츠 렌더링
    const renderContent = () => {
        if (selectedLecture) {
            return (
                <div className="p-6">
                    <LectureDetail selectedLecture={selectedLecture} />
                </div>
            );
        }
        if (role === 'ADMIN') {
            return <AdminPropsalDetail courseId={courseId} />;
        }
        return <StudentCourseDetail courseId={courseId} />;
    };


    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Nav />

                <SidebarProvider className="flex-1 bg-transparent/0 backdrop-blur-sm">
                    <Sidebar dir="rtl" side="left" className="!top-16 !h-[calc(100svh-4rem)] border-r border-white/20 shadow-xl bg-white/70 backdrop-blur-xl">
                        <div className="py-4" />
                        <SidebarHeader
                            className="px-6 py-4 font-bold text-lg text-slate-800 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/50 to-white/50 cursor-pointer hover:bg-indigo-50/80 transition-colors"
                            onClick={() => setSelectedLecture(null)}
                        >
                            {courseInfo ? courseInfo.title : '강좌명'}
                        </SidebarHeader>
                        <SidebarContent className="px-2">
                            <ScrollArea className="h-full">
                                <SidebarGroup>
                                    <SidebarMenu className="gap-1.5 pt-3">
                                        {lectureList.length > 0 ? (
                                            lectureList.map((lecture) => (
                                                <SidebarMenuItem key={lecture.lectureId}>
                                                    <SidebarMenuButton
                                                        onClick={() => handleLectureClick(lecture)}
                                                        isActive={selectedLecture?.lectureId === lecture.lectureId}
                                                        className={`
                                                            w-full justify-start py-6 px-4 rounded-xl transition-all duration-200
                                                            ${selectedLecture?.lectureId === lecture.lectureId
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 font-medium hover:bg-indigo-700'
                                                                : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600'}
                                                        `}
                                                    >
                                                        <div className="flex w-full items-center justify-between">
                                                            <span className="truncate pr-2 text-sm">{lecture.orderNo}강. {lecture.title}</span>
                                                            {role === 'ADMIN' && getStatusBadge(lecture.approvalStatus)}
                                                        </div>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))
                                        ) : (
                                            <SidebarMenuItem>
                                                <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl m-2">
                                                    등록된 강의가 없습니다
                                                </div>
                                            </SidebarMenuItem>
                                        )}
                                    </SidebarMenu>
                                </SidebarGroup>
                            </ScrollArea>
                            {role === 'ADMIN' && (
                                <SidebarFooter className="p-4 border-t border-slate-100/50 bg-slate-50/50 text-xs text-slate-500 font-medium text-center">
                                    승인 {approvedCount} / 반려 {rejectedCount} / 대기 {pendingCount}
                                </SidebarFooter>
                            )}
                        </SidebarContent>
                    </Sidebar>
                    <SidebarInset className="bg-transparent">
                        <div className="flex items-center gap-2 px-6 py-4 lg:hidden">
                            <SidebarTrigger className="text-slate-500 hover:text-indigo-600" />
                        </div>
                        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 overflow-hidden min-h-[600px] relative">
                                {renderContent()}
                            </div>
                        </div>
                        <Tail />
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default ProposalDetail;
