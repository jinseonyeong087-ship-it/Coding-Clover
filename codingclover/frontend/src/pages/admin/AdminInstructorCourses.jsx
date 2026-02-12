import React, { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, CheckCircle2, Clock } from "lucide-react";

function AdminInstructorCourses() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [instructorName, setInstructorName] = useState("");

    useEffect(() => {
        if (!userId) {
            alert('잘못된 접근입니다.');
            navigate('/admin/users/instructors');
            return;
        }

        fetchCourses();
    }, [userId]);

    const fetchCourses = () => {
        setLoading(true);
        fetch(`/admin/course/instructor/${userId}`, {
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
                console.log("강사 강좌 데이터 로드 성공", data);
                setCourses(data);
                if (data.length > 0) {
                    setInstructorName(data[0].instructorName);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('강좌 데이터 로딩 실패', error);
                setLoading(false);
            });
    };

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-gray-50 pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                강사별 강좌 목록
                            </h1>
                            <p className="text-gray-500">
                                특정 강사가 개설했거나 신청 중인 강좌 목록을 확인합니다.
                            </p>
                        </div>

                        {/* 통계 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                                    <div className="text-xs text-gray-500 font-medium">전체 강좌</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {courses.filter(c => c.proposalStatus === 'APPROVED').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 완료</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {courses.filter(c => c.proposalStatus === 'PENDING').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 대기</div>
                                </div>
                            </Card>
                        </div>

                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">강좌번호</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">강좌명</TableHead>
                                        <TableHead className="text-center w-[150px] text-gray-600 font-bold">가격</TableHead>
                                        <TableHead className="text-center w-[150px] text-gray-600 font-bold">상태</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">상세</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : courses.length > 0 ? (
                                        courses.map((course) => (
                                            <TableRow key={course.courseId} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="text-center font-mono text-xs text-gray-400">
                                                    {course.courseId}
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-gray-900">
                                                    {course.title}
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-gray-600">
                                                    {course.price?.toLocaleString()} P
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {course.proposalStatus === 'APPROVED' ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">승인 완료</Badge>
                                                    ) : course.proposalStatus === 'PENDING' ? (
                                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">승인 대기</Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">반려</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/course/${course.courseId}/detail`)}
                                                        className="h-8 px-3 rounded-lg text-xs font-bold border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                    >
                                                        상세보기
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-gray-400">
                                                개설된 강좌가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );
}

export default AdminInstructorCourses;
