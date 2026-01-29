import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import InstructorPermit from "@/components/InstructorPermit"

const getLoginId = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
        const userData = JSON.parse(storedUsers);
        return userData.loginId || null;
    } catch {
        return null;
    }
};

function InstructorMain() {

    const [courses, setCourses] = useState([]);
    const [instructorStatus, setInstructorStatus] = useState(null);

    useEffect(() => {
        const loginId = getLoginId();
        console.log('loginId:', loginId);
        // 강사 상태 조회
        fetch('/api/instructor/mypage', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                console.log('응답 상태:', res.status);
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => {
                console.log('강사 데이터:', data);
                setInstructorStatus(data.status);
            })
            .catch((err) => console.error('에러:', err));
        // 강좌 목록 조회
        fetch('/instructor/course', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setCourses(data))
            .catch((err) => console.error(err));

    }, []);

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

    return (
        <>
            <Nav />
            {instructorStatus == 'ACTIVE' ? (
                <section className="container mx-auto px-4 py-16">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">내 강좌 목록</h1>
                        <Link to="/instructor/course/new">
                            <Button>강좌 개설 신청</Button>
                        </Link>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>강좌명</TableHead>
                                <TableHead>난이도</TableHead>
                                <TableHead>가격</TableHead>
                                <TableHead>상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        등록된 강좌가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow key={course.courseId}>
                                        <TableCell className="font-medium"><Link to={`/instructor/course/${course.courseId}`}>{course.title}</Link></TableCell>
                                        <TableCell>{getLevelText(course.level)}</TableCell>
                                        <TableCell>{course.price?.toLocaleString()}원</TableCell>
                                        <TableCell>{getStatusText(course.proposalStatus)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </section>
            ) : (<InstructorPermit />)}

            <Tail />
        </>
    );

}

export default InstructorMain;