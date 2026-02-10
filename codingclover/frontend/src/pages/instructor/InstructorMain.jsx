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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InstructorPermit from "@/components/InstructorPermit"

const getUserData = () => {
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) return null;
    try {
        return JSON.parse(storedUsers);
    } catch {
        return null;
    }
};

function InstructorMain() {

    const [courses, setCourses] = useState([]);
    const [instructorStatus, setInstructorStatus] = useState("");
    const [totalStudents, setTotalStudents] = useState(0);

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

        // 수강생 현황 조회
        fetch('/instructor/enrollment', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setTotalStudents(data.filter(e => e.status === 'ENROLLED').length))
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
        <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
            <Nav />
            {/* Background Decoration */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {instructorStatus == 'ACTIVE' ? (
                <main className="container mx-auto px-6 py-24 flex-1 max-w-7xl">
                    {/* 헤더 */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                            Instructor Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            강좌 및 강의 승인 현황을 확인하고, 새로운 강좌를 개설하세요.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">내 강좌</h3>
                            <div className="text-3xl font-bold">{courses.length} <span className="text-sm font-normal text-muted-foreground">개</span></div>
                        </div>
                        <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">승인 대기 강좌</h3>
                            <div className="text-3xl font-bold text-amber-500">{courses.filter(c => c.proposalStatus === 'PENDING').length} <span className="text-sm font-normal text-muted-foreground">건</span></div>
                        </div>
                        <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">총 수강생</h3>
                            <div className="text-3xl font-bold text-purple-500">{totalStudents} <span className="text-sm font-normal text-muted-foreground">명</span></div>
                        </div>
                        <Link to="/instructor/course/new" className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                            <span className="text-primary font-bold">+ 강좌 개설 신청 →</span>
                        </Link>
                    </div>

                    {/* 강좌 목록 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                내 강좌 현황
                            </h2>
                            <Badge variant="outline" className="text-xs">{courses.length}개 강좌</Badge>
                        </div>
                        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[400px]">강좌명</TableHead>
                                        <TableHead className="text-center w-[100px]">난이도</TableHead>
                                        <TableHead className="text-center w-[120px]">가격</TableHead>
                                        <TableHead className="text-center w-[100px]">상태</TableHead>
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
                                            <TableRow key={course.courseId} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium">
                                                    <Link to={`/instructor/course/${course.courseId}`} className="hover:text-primary transition-colors flex items-center gap-2">
                                                        {course.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${course.level === 1 ? 'bg-yellow-500/10 text-yellow-600' :
                                                            course.level === 2 ? 'bg-green-500/10 text-green-600' :
                                                                'bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {getLevelText(course.level)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-muted-foreground">
                                                    {course.price?.toLocaleString()}원
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {course.proposalStatus === 'APPROVED' ? (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인</Badge>
                                                    ) : course.proposalStatus === 'PENDING' ? (
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">대기</Badge>
                                                    ) : (
                                                        <Badge variant="outline">반려</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </main>
            ) : (<InstructorPermit />)}

            <Tail />
        </div>
    );

}

export default InstructorMain;