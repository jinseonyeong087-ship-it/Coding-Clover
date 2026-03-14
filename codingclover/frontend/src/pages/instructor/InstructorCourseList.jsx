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

const getUserData = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
        return JSON.parse(storedUsers);
    } catch {
        return null;
    }
};

function InstructorCourseList() {

    const [courses, setCourses] = useState([]);
    const [, setInstructorStatus] = useState("");
    const [studentCountMap, setStudentCountMap] = useState({});

    useEffect(() => {
        const userData = getUserData();
        const loginId = userData?.loginId;
        console.log('userData:', userData);

        // localStorage에서 강사 상태 설정
        if (userData?.status) {
            setInstructorStatus(userData.status);
        }
        // 강좌 목록 조회
        fetch('/instructor/course', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setCourses(data))
            .catch((err) => console.error(err));

        // 강좌별 수강생 수 조회
        fetch('/instructor/enrollment', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('수강생 수 조회 실패');
                return res.json();
            })
            .then((data) => setStudentCountMap(data))
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

    const handleDelete = (courseId) => {
        if (window.confirm("정말로 이 강좌를 삭제하시겠습니까? 삭제된 강좌는 복구할 수 없습니다.")) {
            fetch(`/instructor/course/${courseId}/delete`, {
                method: 'DELETE',
                credentials: 'include',
            })
                .then((res) => {
                    if (res.ok) {
                        alert("강좌가 삭제되었습니다.");
                        setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
                    } else {
                        res.text().then((text) => alert(text || "삭제에 실패했습니다."));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert("오류가 발생했습니다.");
                });
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-white relative overflow-hidden">
            <Nav />
            {/* Background Decoration */}

            <main className="container mx-auto px-6 py-24 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-black mb-2">
                            내 강좌 관리
                        </h1>
                        <p className="text-muted-foreground">
                            등록한 강좌의 상태를 확인하고 관리하세요.
                        </p>
                    </div>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50 border-b border-border/50">
                                <TableHead className="w-[400px]">강좌명</TableHead>
                                <TableHead>난이도</TableHead>
                                <TableHead>가격</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead className="w-[140px]">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                        등록된 강좌가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow key={course.courseId} className="hover:bg-muted/50 border-b border-border/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                {/* 썸네일 추가 */}
                                                <div className="w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                                    {course.thumbnailUrl ? (
                                                        <img
                                                            src={course.thumbnailUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted/50">
                                                            <span className="text-[10px]">No Img</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Link to={`/instructor/course/${course.courseId}`} className="hover:text-primary transition-colors">
                                                    {course.title}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${course.level === 1 ? 'bg-yellow-500/10 text-yellow-600' :
                                                course.level === 2 ? 'bg-green-500/10 text-green-600' :
                                                    'bg-red-500/10 text-red-600'
                                                }`}>
                                                {getLevelText(course.level)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-muted-foreground">
                                            {course.price?.toLocaleString()}P
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${course.proposalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                course.proposalStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                    'bg-red-500/10 text-red-600 border-red-500/20'
                                                }`}>
                                                {getStatusText(course.proposalStatus)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {course.proposalStatus !== 'APPROVED' ? (
                                                    <>
                                                        <Link to={`/instructor/course/edit/${course.courseId}`}>
                                                            <Button variant="outline" size="sm">수정</Button>
                                                        </Link>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(course.courseId)}
                                                        >
                                                            삭제
                                                        </Button>
                                                    </>
                                                ) : course.proposalStatus === 'APPROVED' && (
                                                    <span>수강생 {studentCountMap[course.courseId] || 0}명</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>

            <Tail />
        </div>
    );

}

export default InstructorCourseList;