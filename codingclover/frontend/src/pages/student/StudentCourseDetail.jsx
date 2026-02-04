// 수강생 수강신청 & 강좌 & 강의 페이지
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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

function StudentCourseDetail() {

    const { courseId } = useParams();
    const [course, setCourse] = useState([]);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState({ title: '', description: '' });
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
            .catch(() => {});
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
                    if (data.length > 0) {
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
                    description: '신청내역은 마이페이지에서 볼 수 있습니다.'
                });
            } else {
                const errorText = await res.text();
                setDialogMessage({
                    title: '수강신청 실패',
                    description: errorText || '수강신청 중 오류가 발생했습니다.'
                });
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

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    

    return (
        <>
            <section className="container mx-auto px-16 py-16">
                <div className="flex max-w-2xl flex-col gap-4 text-sm">
                    <div className="flex flex-col gap-1.5">
                        <div className="leading-none font-bold text-lg">강좌명</div>
                        <div className="text-xl">{course.title}</div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <span className="font-semibold">난이도:</span> {getLevelText(course.level)}
                        </div>
                        <div>
                            <span className="font-semibold">가격:</span> {course.price?.toLocaleString()}원
                        </div>
                        <div>
                            <span className="font-semibold">강사명:</span> {course.instructorName}
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="font-semibold mb-1">강좌 설명</div>
                        <div className="bg-slate-50 p-4 rounded-md border">
                            {course.description}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        {enrollmentStatus === 'ENROLLED' ? (
                            <Button disabled>수강 중</Button>
                        ) : enrollmentStatus === 'COMPLETED' ? (
                            <Button disabled>수강 완료</Button>
                        ) : enrollmentStatus === 'CANCELLED' ? (
                            <Button disabled>수강 취소</Button>
                        ) : (
                            <Button onClick={handleSubmit}>수강 신청</Button>
                        )}

                        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{dialogMessage.title}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {dialogMessage.description}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction onClick={() => setDialogOpen(false)}>확인</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="ghost" onClick={() => navigate(-1)}>뒤로 가기</Button>
                    </div>
                </div>
            </section>

            {/* 수강 중/완료일 때 강의 목록 및 영상 재생 */}
            {(enrollmentStatus === 'ENROLLED' || enrollmentStatus === 'COMPLETED') && (
                <section className="container mx-auto px-16 pb-16">
                    <Separator className="mb-8" />
                    <h2 className="text-lg font-bold mb-4">강의 목록</h2>

                    <div className="flex gap-6">
                        {/* 강의 목록 */}
                        <div className="w-64 flex-shrink-0">
                            <div className="flex flex-col gap-1 border rounded-md p-2">
                                {lectureList.length > 0 ? (
                                    lectureList.map((lecture) => (
                                        <button
                                            key={lecture.lectureId}
                                            onClick={() => setSelectedLecture(lecture)}
                                            className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                selectedLecture?.lectureId === lecture.lectureId
                                                    ? 'bg-slate-200 font-semibold'
                                                    : 'hover:bg-slate-100'
                                            }`}
                                        >
                                            <div>{lecture.orderNo}강. {lecture.title}</div>
                                            {lecture.duration && (
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {formatDuration(lecture.duration)}
                                                </div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground px-3 py-4 text-center">
                                        등록된 강의가 없습니다
                                    </div>
                                )}
                            </div>
                        </div>

                 
                    </div>
                </section>
            )}
        </>
    )
}

export default StudentCourseDetail;
