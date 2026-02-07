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
    const navigate = useNavigate();

    // 강의 목록 & 선택된 강의
    const [lectureList, setLectureList] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);

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
        }
    }, [courseId, enrollmentStatus]);

    // 수강 신청
    const handleSubmit = async () => {
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
                if (res.status === 401 || res.status === 403) {
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
            {/* Nav spacer */}
            {/* <div className="h-[70px] shrink-0"></div> */}

            {/* Classroom Layout (Enrolled) - 주석 처리 */}
            {/* {isEnrolled && (
                <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-70px)] overflow-hidden">
                    <main className="flex-1 flex flex-col overflow-y-auto bg-black/95 relative">
                        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                            <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                {selectedLecture ? (
                                    <LectureDetail selectedLecture={selectedLecture} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                                        <MonitorPlay className="w-16 h-16 opacity-50" />
                                        <p>강의를 선택해주세요</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 lg:px-12 bg-background border-t border-border">
                            <h1 className="text-2xl font-bold mb-2">{selectedLecture?.title || "강의를 선택하세요"}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.title}</span>
                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.instructorName}</span>
                            </div>
                        </div>
                    </main>
                    <aside className="w-full lg:w-96 bg-background border-l border-border flex flex-col shrink-0 z-10">
                        <div className="p-5 border-b border-border bg-muted/20 backdrop-blur-sm">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <ListIcon className="w-5 h-5 text-primary" />
                                강의 목차
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                총 {lectureList.length}개의 강의
                            </p>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {lectureList.map((lecture, idx) => (
                                    <button
                                        key={lecture.lectureId}
                                        onClick={() => setSelectedLecture(lecture)}
                                        className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-start gap-3 group border
                                            ${selectedLecture?.lectureId === lecture.lectureId
                                                ? 'bg-primary/10 border-primary/20 text-primary shadow-sm'
                                                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <div className="mt-0.5">
                                            {selectedLecture?.lectureId === lecture.lectureId ? (
                                                <PlayCircle className="w-5 h-5 fill-current" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] font-bold">
                                                    {idx + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium line-clamp-2">{lecture.title}</div>
                                            <div className="text-xs opacity-70 mt-1">{formatDuration(lecture.duration)}</div>
                                        </div>
                                    </button>
                                ))}
                                {lectureList.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        등록된 강의가 없습니다.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </aside>
                </div>
            )} */}

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
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">Lectures</div>
                                    <div className="font-bold">총 {lectureList.length || '?'}강</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5 text-primary" />
                                커리큘럼 미리보기
                            </h3>
                            {/* Assuming we can fetch lectures even if not enrolled? 
                                    Usually we can't or only titles. 
                                    If backend blocks it, we might show placeholder or "Enroll to view" 
                                    The current code fetches lectrues ONLY if enrolled. 
                                    So we show a placeholder here. 
                                 */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4" />
                                        <span>1강. 오리엔테이션</span>
                                    </div>
                                    <Badge variant="outline">잠김</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4" />
                                        <span>2강. 강의 시작하기</span>
                                    </div>
                                    <Badge variant="outline">잠김</Badge>
                                </div>
                                <div className="text-center text-sm text-muted-foreground pt-2">
                                    수강 신청 후 전체 강의를 확인할 수 있습니다.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden">
                            <div className="bg-muted/50 p-6 flex items-center justify-center">
                                {/* Placeholder for Course Image if available */}
                                <MonitorPlay className="w-20 h-20 text-muted-foreground/30" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">수강료</div>
                                    <div className="text-3xl font-black">{course.price?.toLocaleString()}원</div>
                                </div>

                                {enrollmentStatus === 'COMPLETED' ? (
                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="w-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all"
                                            onClick={() => navigate(`/student/course/${courseId}/lectures`)}
                                        >
                                            수강완료
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full font-bold text-lg"
                                            onClick={() => navigate(`/student/course/${courseId}/certificate`)}
                                        >
                                            <Award className="w-5 h-5 mr-2" />
                                            수료증 발급
                                        </Button>
                                    </div>
                                ) : enrollmentStatus === 'ENROLLED' ? (
                                    <Button
                                        size="lg"
                                        className="w-full font-bold text-lg shadow-lg hover:shadow-primary/25 transition-all"
                                        onClick={() => navigate(`/student/course/${courseId}/lectures`)}
                                    >
                                        강의 시청
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
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>무제한 수강 가능</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>모바일/PC 지원</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span>수료증 발급</span>
                                    </div>
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
