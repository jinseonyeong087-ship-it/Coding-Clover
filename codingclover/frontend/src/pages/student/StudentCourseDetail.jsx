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
    // 강의 미리보기 (비로그인용)
    const [previewLectures, setPreviewLectures] = useState([]);
    // 가장 최근 시청한 강의 ID
    const [lastWatchedLectureId, setLastWatchedLectureId] = useState(null);
    // 강의별 진도 상태 { lectureId: { completedYn, lastWatchedAt } }
    const [progressMap, setProgressMap] = useState({});

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
                                    <div className="font-bold">총 {lectureList.length || previewLectures.length || '?'}강</div>
                                </div>
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
                                                    if (p?.completedYn) return <span className="text-emerald-600 font-bold" title="완료">●</span>;
                                                    if (p?.lastWatchedAt) return <span className="text-indigo-500 font-bold" title="시청 중">◎</span>;
                                                    return <span className="text-muted-foreground" title="미시청">○</span>;
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
                                        onClick={() => navigate(`/student/lecture/${lastWatchedLectureId || lectureList[0]?.lectureId}`)}
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
