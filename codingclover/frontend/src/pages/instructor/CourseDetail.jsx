import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import InstructorNav from "@/components/InstructorNav";
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/Button";

function CourseDetail() {

    const { courseId } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        fetch(`/instructor/course/${courseId}`, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setCourse(data))
            .catch((err) => console.error(err));
    }, [courseId]);

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return '승인 대기';
            case 'APPROVED': return '승인 완료';
            case 'REJECTED': return '반려';
            default: return status;
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    if (!course) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <>
            <InstructorNav />
            <section className="container mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                    <Link to="/instructor/dashboard">
                        <Button variant="outline">목록으로</Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="font-semibold">난이도: </span>
                        {getLevelText(course.level)}
                    </div>
                    <div>
                        <span className="font-semibold">가격: </span>
                        {course.price?.toLocaleString()}원
                    </div>
                    <div>
                        <span className="font-semibold">상태: </span>
                        {getStatusText(course.proposalStatus)}
                    </div>
                    <div>
                        <span className="font-semibold">설명: </span>
                        <p className="mt-2 bg-slate-50 p-4 rounded-md border">{course.description}</p>
                    </div>
                </div>
            </section>
            <Tail />
        </>
    );

}

export default CourseDetail;