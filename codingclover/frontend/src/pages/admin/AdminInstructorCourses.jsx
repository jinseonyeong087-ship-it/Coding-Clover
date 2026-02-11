import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
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
import { ArrowLeft, BookOpen, Video } from "lucide-react";

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
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-7xl">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/users/instructors')}
                        className="mb-8 hover:bg-white/50 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        강사 목록으로 돌아가기
                    </Button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            {instructorName ? `${instructorName} 강사의 강좌 목록` : '강좌 목록'}
                        </h1>
                        <p className="text-slate-500">
                            해당 강사가 개설한 모든 강좌와 강의를 확인할 수 있습니다.
                        </p>
                    </div>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-white/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="text-center w-[80px]">ID</TableHead>
                                    <TableHead className="text-center">강좌명</TableHead>
                                    <TableHead className="text-center w-[100px]">난이도</TableHead>
                                    <TableHead className="text-center w-[100px]">수강료</TableHead>
                                    <TableHead className="text-center w-[120px]">상태</TableHead>
                                    <TableHead className="text-center w-[150px]">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : courses && courses.length > 0 ? (
                                    courses.map((course) => (
                                        <TableRow key={course.courseId} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="text-center text-slate-500">{course.courseId}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-8 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                                                        {course.thumbnailUrl ? (
                                                            <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-slate-700">{course.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {course.level === 1 ? <Badge variant="outline" className="text-slate-500">초급</Badge> :
                                                    course.level === 2 ? <Badge variant="outline" className="text-indigo-500 border-indigo-200">중급</Badge> :
                                                        <Badge variant="outline" className="text-purple-500 border-purple-200">고급</Badge>}
                                            </TableCell>
                                            <TableCell className="text-center text-slate-600">
                                                {course.price > 0 ? `${course.price.toLocaleString()}P` : '무료'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {course.proposalStatus === 'APPROVED' ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">승인됨</Badge>
                                                ) : course.proposalStatus === 'REJECTED' ? (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">반려됨</Badge>
                                                ) : (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">승인 대기</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link to={`/admin/course/${course.courseId}`}>
                                                    <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-100 hover:border-indigo-200">
                                                        <Video className="w-4 h-4 mr-1.5" />
                                                        강의 상세
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                                            등록된 강좌가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
                <Tail />
            </div>
        </>
    );
}

export default AdminInstructorCourses;
