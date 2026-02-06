import React, { useState, useEffect } from "react";
import InstructorNav from "@/components/InstructorNav";
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/Button";
import LectureUpload from "@/components/LectureUpload";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

function InstructorLecture() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lectureList, setLectureList] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    // 승인된 강좌 목록 가져오기
    useEffect(() => {
        fetch('/instructor/course', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강좌 목록 조회 실패');
                return res.json();
            })
            .then((data) => {
                const approved = data.filter(c => c.proposalStatus === 'APPROVED');
                setCourses(approved);
            })
            .catch((err) => console.error(err.message));
    }, []);

    // 강좌 선택 시 강의 목록 가져오기
    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setIsAdding(false);
        fetch(`/instructor/course/${course.courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch((err) => {
                console.error(err.message);
                setLectureList([]);
            });
    };

    // 업로드 완료 후 목록 갱신
    const handleUploaded = () => {
        if (selectedCourse) {
            handleSelectCourse(selectedCourse);
        }
        setIsAdding(false);
    };

    const nextOrderNo = lectureList.length + 1;

    return (
        <>
            <InstructorNav />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">강의 업로드</h1>

                {/* 강좌 선택 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">강좌 선택</label>
                    {courses.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent>
                                {courses.map((course) => (
                                    <CarouselItem key={course.courseId} className="basis-1/5">
                                        <div
                                            onClick={() => handleSelectCourse(course)}
                                            className={`cursor-pointer p-4 border rounded-md text-center transition-colors ${
                                                selectedCourse?.courseId === course.courseId
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-white hover:bg-accent'
                                            }`}
                                        >
                                            <p className="font-medium truncate">{course.title}</p>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <p className="text-muted-foreground">승인된 강좌가 없습니다.</p>
                    )}
                </div>

                {/* 선택된 강좌의 강의 목록 */}
                {selectedCourse && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">
                            {selectedCourse.title} - 등록된 강의 ({lectureList.length}개)
                        </h2>
                        {lectureList.length > 0 ? (
                            <ul className="space-y-1 mb-4">
                                {lectureList.map((lecture) => (
                                    <li key={lecture.lectureId} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                                        <span className="font-medium">{lecture.orderNo}강.</span>
                                        <span>{lecture.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            lecture.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            lecture.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {lecture.approvalStatus === 'APPROVED' ? '승인' :
                                             lecture.approvalStatus === 'REJECTED' ? '반려' : '대기'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground mb-4">등록된 강의가 없습니다.</p>
                        )}

                        <Button onClick={() => setIsAdding(!isAdding)}>
                            {isAdding ? '취소' : `${nextOrderNo}강 추가`}
                        </Button>
                    </div>
                )}

                {/* 강의 업로드 폼 */}
                {isAdding && selectedCourse && (
                    <LectureUpload
                        courseId={selectedCourse.courseId}
                        courseInfo={selectedCourse}
                        nextOrderNo={nextOrderNo}
                        onUploaded={handleUploaded}
                    />
                )}
            </div>
            <Tail />
        </>
    );
}

export default InstructorLecture;
