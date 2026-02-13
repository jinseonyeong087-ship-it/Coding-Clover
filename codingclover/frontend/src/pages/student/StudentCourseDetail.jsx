// 수강생 수강신청 & 강좌 & 강의 페이지
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    PlayCircle, CheckCircle, Lock, MonitorPlay,
    BookOpen, User, Calendar, FileText, ChevronLeft,
    AlertCircle, Award
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import LectureDetail from "@/pages/student/StudentLectureDetail";

function StudentCourseDetail() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState({ title: '', description: '' });
    const [loginRequired, setLoginRequired] = useState(false);
    const [, setRegister] = useState(false);
    const navigate = useNavigate();
    const users = JSON.parse(localStorage.getItem('users'));

    // 강의 목록 & 선택된 강의
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    // 강의 미리보기 (비로그인용)
    const [previewLectures, setPreviewLectures] = useState([]);
    // 가장 최근 시청한 강의 ID
    const [lastWatchedLectureId, setLastWatchedLectureId] = useState(null);
    // 강의별 진도 상태 { lectureId: { completedYn, lastWatchedAt } }
    const [progressMap, setProgressMap] = useState({});

    // 시험 응시 처리
    const handleExamAttempt = async () => {
        try {
            // 시험 존재 여부 확인
            const response = await fetch(`/api/exam/course/${courseId}/check`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                const examExists = await response.json();
                if (examExists) {
                    // 시험이 존재하면 시험 페이지로 이동
                    navigate(`/student/exam/course/${courseId}`);
                } else {
                    // 시험이 없으면 알림 다이얼로그 표시
                    setDialogMessage({
                        title: '시험 미출제',
                        description: '해당 강좌의 시험이 아직 출제되지 않았습니다. 강사가 시험을 출제할 때까지 기다려주세요.'
                    });
                    setDialogOpen(true);
                }
            } else if (response.status === 404) {
                // 404는 시험이 아직 출제되지 않았음을 의미
                setDialogMessage({
                    title: '시험 미출제',
                    description: '해당 강좌의 시험이 아직 출제되지 않았습니다. 강사가 시험을 출제할 때까지 기다려주세요.'
                });
                setDialogOpen(true);
            } else {
                throw new Error('시험 정보 조회 실패');
            }
        } catch (error) {
            console.error('시험 응시 오류:', error);
            // 네트워크 오류 등의 경우에만 에러 메시지 표시
            setDialogMessage({
                title: '오류 발생',
                description: '시험 정보를 확인하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            });
            setDialogOpen(true);
        }
    };

    // 강좌 정보 + 수강 상태 가져오기
    useEffect(() => {
        // 강좌 정보
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

        // 강의 미리보기 조회 (비로그인도 가능)
        fetch(`/course/${courseId}/lectures/preview`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setPreviewLectures(data))
            .catch(() => { });

        // 내 수강 목록에서 현재 강좌의 수강 상태 확인
        fetch('/student/enrollment', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => res.ok ? res.json() : [])
            .then((data) => {
                const found = data.find(e => String(e.courseId) === String(courseId));
                if (found) {
                    setEnrollmentStatus(found.status);
                }
            })
            .catch(() => { });
    }, [courseId]);

    // 수강 중일 때 강의 목록 가져오기
    useEffect(() => {
        if (enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED') {
            fetch(`/student/lecture/${courseId}/lectures`, {
                method: 'GET',
                credentials: 'include'
            })
                .then((res) => {
                    if (!res.ok) throw new Error('강의 목록 조회 실패');
                    return res.json();
                })
                .then((data) => {
                    setLectureList(data);
                    // 선택된 강의가 없으면 첫번째 강의 선택
                    if (data.length > 0 && !selectedLecture) {
                        setSelectedLecture(data[0]);
                    }
                })
                .catch((err) => console.error('강의 목록 조회 실패:', err));

            // 진도 데이터 조회 → 가장 최근 시청 강의 찾기
            fetch(`/api/student/course/${courseId}/progress`, { credentials: 'include' })
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    if (data.length > 0) {
                        // progressMap 저장
                        const map = {};
                        data.forEach(p => {
                            map[p.lectureId] = { completedYn: p.completedYn, lastWatchedAt: p.lastWatchedAt };
                        });
                        setProgressMap(map);

                        // 가장 최근 시청 강의 찾기
                        const lastWatched = data
                            .filter(p => p.lastWatchedAt)
                            .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))[0];
                        if (lastWatched) {
                            setLastWatchedLectureId(lastWatched.lectureId);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [courseId, enrollmentStatus]);

    // 수강 신청
    const handleSubmit = async () => {
        if (users?.role === 'ADMIN' || users?.role === 'INSTRUCTOR') {
            setDialogMessage({
                title: '권한 없음',
                description: '수강생 계정으로 수강신청 할 수 있습니다.'
            });
            setDialogOpen(true);
            return;
        }

        try {
            const res = await fetch(`/student/enrollment/${courseId}/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (res.ok) {
                setEnrollmentStatus('ENROLLED');
                setDialogMessage({
                    title: '수강신청이 완료되었습니다.',
                    description: '지금 바로 학습을 시작할 수 있습니다.'
                });
            } else {
                if (res.status === 403) {
                    setLoginRequired(true);
                    setDialogMessage({
                        title: '로그인 필요',
                        description: '로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?'
                    });
                } else {
                    const errorText = await res.text();
                    setDialogMessage({
                        title: '수강신청 실패',
                        description: errorText || '수강신청 중 오류가 발생했습니다.'
                    });
                }
            }
            setDialogOpen(true);
        } catch (err) {
            setDialogMessage({
                title: '수강신청 실패',
                description: '서버와 통신 중 오류가 발생했습니다.'
            });
            setDialogOpen(true);
        }
    }

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

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse text-muted-foreground">강좌 정보를 불러오는 중...</div>
        </div>
    );

    const isEnrolled = enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Nav />
            {/* Course Info Layout - 항상 표시 */}
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
                                <Badge variant="secondary">{course.category || "프로그래밍"}</Badge>
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
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-bold uppercase">Lectures</div>
                                        <div className="font-bold">총 {lectureList.length || previewLectures.length || '?'}강</div>
                                    </div>
                                </div>
                                {/* 시험 응시 버튼 - 수강 중일 때만 표시 */}
                                {(enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED') && (
                                    <Button
                                        size="sm"
                                        className="font-medium shadow-lg hover:shadow-primary/25 transition-all"
                                        onClick={handleExamAttempt}
                                    >
                                        시험 응시
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5 text-primary" />
                                커리큘럼 미리보기
                            </h3>
                            <div className="space-y-3">
                                {enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED' ? (
                                    lectureList.length > 0 ? (
                                        lectureList.map((lecture) => (
                                            <div
                                                key={lecture.lectureId}
                                                className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all"
                                                onClick={() => navigate(`/student/lecture/${lecture.lectureId}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <PlayCircle className="w-4 h-4 text-primary" />
                                                    <span>{lecture.orderNo}강. {lecture.title}</span>
                                                </div>
                                                {(() => {
                                                    const p = progressMap[lecture.lectureId];
                                                    if (p?.completedYn) return <span className="text-blue-500 font-bold" title="완료">●</span>;
                                                    if (p?.lastWatchedAt) return <span className="text-blue-500 font-bold" title="시청 중">◎</span>;
                                                    return <span className="text-blue-500 font-bold" title="미시청">○</span>;
                                                })()}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground py-8">
                                            등록된 강의가 없습니다.
                                        </div>
                                    )
                                ) : previewLectures.length > 0 ? (
                                    <>
                                        {previewLectures.map((lecture) => (
                                            <div key={lecture.orderNo} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 opacity-60">
                                                <div className="flex items-center gap-3">
                                                    <Lock className="w-4 h-4" />
                                                    <span>{lecture.orderNo}강. {lecture.title}</span>
                                                </div>
                                                <Badge variant="outline">잠김</Badge>
                                            </div>
                                        ))}
                                        <div className="text-center text-sm text-muted-foreground pt-2">
                                            수강 신청 후 전체 강의를 확인할 수 있습니다.
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        등록된 강의가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden">
                            <div className="bg-muted/50 p-6 flex items-center justify-center relative overflow-hidden group">
                                {course.thumbnailUrl ? (
                                    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <MonitorPlay className="w-20 h-20 text-muted-foreground/30" />
                                )}
                            </div>
                            <div className="p-6 space-y-6">

                                {enrollmentStatus === 'COMPLETED' ? (
                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="w-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all"
                                            onClick={() => navigate(`/student/course/${courseId}/lectures`)}
                                        >
                                            수강완료
                                        </Button>
                                    </div>
                                ) : enrollmentStatus === 'ENROLLED' ? (
                                    <Button
                                        size="lg"
                                        className="w-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all"
                                        onClick={() => navigate(`/student/lecture/${lastWatchedLectureId || lectureList[0]?.lectureId}`)}
                                    >
                                        수강 중
                                    </Button>
                                ) : (

                                    <Button
                                        size="lg"
                                        className="w-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all"
                                        onClick={handleSubmit}
                                    >
                                        수강 신청하기
                                    </Button>
                                )}

                                <div className="space-y-3 text-sm text-muted-foreground">
                                    {enrollmentStatus !== 'ENROLLED' && enrollmentStatus !== 'COMPLETED' && (
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-blue-600" />
                                            <span>수강 포인트 : {course?.price?.toLocaleString()}P</span>
                                        </div>
                                    )}


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogMessage.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogMessage.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            setDialogOpen(false);
                            if (loginRequired) {
                                navigate('/auth/login');
                                setLoginRequired(false);
                            }
                            if (enrollmentStatus === 'ENROLLED') {
                                // Optional: Redirect to classroom?
                            }
                        }}>확인</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Helper icons
function ListIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
    )
}

const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default StudentCourseDetail;
