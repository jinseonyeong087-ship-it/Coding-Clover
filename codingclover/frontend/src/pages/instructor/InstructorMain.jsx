import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Upload } from "lucide-react";

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
    const [, setInstructorStatus] = useState("");
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        const userData = getUserData();
        const loginId = userData?.loginId;

        // 서버에서 최신 status를 가져와 instructorStatus state를 설정
        // localStorage도 함께 동기화하여 다른 페이지에서도 일관성 유지
        // API 실패 시에만 fallback으로 localStorage 값 사용
        fetch('/api/instructor/mypage', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId },
            credentials: 'include'
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.status) {
                    setInstructorStatus(data.status);
                    const stored = getUserData();
                    if (stored) {
                        stored.status = data.status;
                        localStorage.setItem('users', JSON.stringify(stored));
                    }
                }
            })
            .catch(() => {
                if (userData?.status) setInstructorStatus(userData.status);
            });

        // 강좌 목록 조회
        fetch('/instructor/course', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setCourses(data))
            .catch((err) => console.error(err));

        // 강좌별 수강생 수 조회 → 합산하여 총 수강생 계산
        fetch('/instructor/enrollment', { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Login-Id': loginId }, credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('인증 필요');
                return res.json();
            })
            .then((data) => setTotalStudents(Object.values(data).reduce((sum, count) => sum + count, 0)))
            .catch((err) => console.error(err));

    }, []);

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
            <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-0.5">내 강좌</p>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {courses.length}<span className="text-sm font-bold text-gray-400 ml-1">개</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-0.5">승인 대기 강좌</p>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {courses.filter(c => c.proposalStatus === 'PENDING').length}<span className="text-sm font-bold text-gray-400 ml-1">건</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-50">
                                <Users className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-0.5">총 수강생</p>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {totalStudents}<span className="text-sm font-bold text-gray-400 ml-1">명</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Link to="/instructor/lecture/upload">
                        <Card className="border-gray-200 bg-white shadow-sm h-full">
                            <CardContent className="p-5 flex items-center gap-4 h-full">
                                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                                    <Upload className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold mb-0.5">강의 업로드</p>
                                    <p className="text-2xl font-extrabold text-primary">→</p>
                                </div>
                            </CardContent>
                        </Card>
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
                                                <Link className="hover:text-primary transition-colors flex items-center gap-2" to={`/instructor/course/${course.courseId}`} >
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
                                                {course.price?.toLocaleString()}P
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

            <Tail />
        </div>
    );

}

export default InstructorMain;