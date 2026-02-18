import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, UserPlus, Upload } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

function AdminMain() {

    /** id, 난이도, 강좌명, 강사명, 승인상태 */
    const [course, setCourse] = useState([]);
    const [status, setStatus] = useState([]);
    const [lecture, setLecture] = useState([]);

    // 생성 후 24시간 이내면 NEW 배지 표시
    const isNewCourse = (createdAt) => {
        if (!createdAt) return false;

        const created = new Date(createdAt);
        const now = new Date();

        // 24시간 기준
        return (now - created) <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        // 강좌 목록 조회
        fetch('/admin/course/{id}/pending', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((resData) => {
                console.log("강좌 데이터 로드 성공", resData);
                if (Array.isArray(resData)) {
                    setCourse(resData);
                } else if (resData && typeof resData === 'object') {
                    const list = resData.content || resData.list || [resData];
                    setCourse(Array.isArray(list) ? list : [list]);
                }
            })
            .catch((error) => {
                console.error('강좌 데이터 로딩 실패', error);
            });

        // 강사 목록 조회
        fetch('/admin/users/instructors', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("강사 데이터 로드 성공", data);
                setStatus(data);
            })
            .catch((error) => {
                console.error('강사 데이터 로딩 실패', error);
            });
        // 강의 불러오기
        fetch(`/admin/lectures/pending`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("강의 데이터 로드 성공", data);
                setLecture(data);
            })
            .catch((error) => {
                console.error('강의 데이터 로딩 실패', error);
            });
    }, []);

    return (
        <>
            <Nav />
            {/* Background Decoration Removed per user feedback */}

            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">
                    {/* Admin Sidebar */}
                    <AdminSidebar />

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-500">
                                관리자 대시보드입니다. 강좌, 강사, 강의 업로드를 관리하세요.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50">
                                        <BookOpen className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">개설된 강좌</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {course.length}<span className="text-sm font-bold text-gray-400 ml-1">개</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50">
                                        <UserPlus className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">신규 강사 신청</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {status.filter(u => u.status === 'SUSPENDED' && u.profileStatus !== 'REJECTED').length}<span className="text-sm font-bold text-gray-400 ml-1">명</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">강의 업로드 대기</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {lecture.filter(l => l.approvalStatus === 'PENDING').length}<span className="text-sm font-bold text-gray-400 ml-1">건</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                            {/* ================= 강좌 승인 ================= */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <span className="w-2 h-8 bg-primary rounded-full" />
                                        강좌 개설 승인
                                    </h2>
                                    <Badge variant="outline" className="text-xs bg-white">{course.filter(c => c.proposalStatus === 'PENDING').length}건 대기중</Badge>
                                </div>
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="text-center w-[80px]">ID</TableHead>
                                                <TableHead className="text-center">강좌명</TableHead>
                                                <TableHead className="text-center w-[100px]">강사</TableHead>
                                                <TableHead className="text-center w-[80px]">상태</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {course && course.length > 0 ? (
                                                course.slice(0, 5).map((item, index) => {
                                                    const uniqueKey = item.courseId || `course-idx-${index}`;
                                                    return (
                                                        <TableRow key={uniqueKey} className="hover:bg-gray-50/50 transition-colors">
                                                            <TableCell className="text-center font-mono text-xs text-gray-500">
                                                                {item.courseId}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Link to={`/admin/course/${item.courseId}`} className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]">
                                                                    {item.title}
                                                                    {isNewCourse(item.createdAt) && (
                                                                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full ml-1.5 align-middle mb-0.5" />
                                                                    )}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-center text-sm text-gray-600">{item.instructorName}</TableCell>
                                                            <TableCell className="text-center">
                                                                {item.proposalStatus === 'PENDING' ? (
                                                                    <Badge variant="secondary" className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">대기</Badge>
                                                                ) : item.proposalStatus === 'APPROVED' ? (
                                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200">승인</Badge>
                                                                ) : (
                                                                    <Badge variant="outline">반려</Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        대기 중인 강좌가 없습니다.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            {/* ================= 강사 승인 ================= */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <span className="w-2 h-8 bg-primary rounded-full" />
                                        신규 강사 승인
                                    </h2>
                                    <Badge variant="outline" className="text-xs bg-white">{status.filter(u => u.status === 'SUSPENDED' && u.profileStatus !== 'REJECTED').length}명 대기중</Badge>
                                </div>
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="text-center w-[80px]">ID</TableHead>
                                                <TableHead className="text-center">강사명</TableHead>
                                                <TableHead className="text-center w-[100px]">상태</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {status.filter(users => users.status === 'SUSPENDED' && users.profileStatus !== 'REJECTED').length > 0 ? (
                                                status.filter(users => users.status === 'SUSPENDED' && users.profileStatus !== 'REJECTED').slice(0, 5).map((users, index) => {
                                                    const uniqueKey = users.userId || `user-idx-${index}`;
                                                    return (
                                                        <TableRow key={uniqueKey} className="hover:bg-gray-50/50 transition-colors">
                                                            <TableCell className="text-center font-mono text-xs text-gray-500">{users.userId}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Link to={`/admin/users/instructors/${users.userId}`} className="font-medium hover:underline hover:text-primary">
                                                                    {users.name}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="secondary" className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">승인 필요</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                                        승인 대기 중인 강사가 없습니다.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </div>

                        {/* 강의 승인란 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-2 h-8 bg-blue-600 rounded-full" />
                                    강의 업로드 승인
                                </h2>
                                <Badge variant="outline" className="text-xs bg-white">{lecture.filter(l => l.approvalStatus === 'PENDING').length}건 대기중</Badge>
                            </div>
                            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="text-center w-[60px]">No</TableHead>
                                            <TableHead className="text-center w-[80px]">순서</TableHead>
                                            <TableHead className="text-left">강의 제목</TableHead>
                                            <TableHead className="text-center w-[120px]">강사명</TableHead>
                                            <TableHead className="text-center w-[150px]">업로드 일정</TableHead>
                                            <TableHead className="text-center w-[100px]">상태</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lecture && lecture.length > 0 ? (
                                            lecture.slice(0, 8).map((item, index) => {
                                                const uniqueKey = item.lectureId || `lecture-idx-${index}`;
                                                return (
                                                    <TableRow key={uniqueKey} className="hover:bg-gray-50/50 transition-colors">
                                                        <TableCell className="text-center font-mono text-xs text-gray-500">{item.lectureId}</TableCell>
                                                        <TableCell className="text-center font-bold text-gray-500">{item.orderNo}강</TableCell>
                                                        <TableCell>
                                                            <Link to={`/admin/lectures/${item.lectureId}`} className="font-medium hover:text-primary transition-colors block truncate max-w-[300px]">
                                                                {item.title}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-gray-600">{item.createdByName}</TableCell>
                                                        <TableCell className="text-center text-xs text-gray-400">{item.scheduledAt}</TableCell>
                                                        <TableCell className="text-center">
                                                            {item.approvalStatus === 'PENDING' ? (
                                                                <Badge variant="secondary" className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">대기</Badge>
                                                            ) : item.approvalStatus === 'APPROVED' ? (
                                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200">승인</Badge>
                                                            ) : (
                                                                <Badge variant="outline">반려</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                                    업로드된 강의가 없습니다.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );

}

export default AdminMain;
