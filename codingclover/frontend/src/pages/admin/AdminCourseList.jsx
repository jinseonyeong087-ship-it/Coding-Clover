import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Link, useNavigate } from "react-router-dom";
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
import { LayoutGrid, BookCheck, ClipboardList } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

function AdminCourseList() {

    const [course, setCourse] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/admin/course', {
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
    }, [])

    const isNewCourse = (createdAt) => {
        if (!createdAt) return false;
        const created = new Date(createdAt);
        const now = new Date();
        return (now - created) <= 1000 * 60 * 60 * 24;
    };

    // Sorting and Pagination Logic
    const sortedCourses = [...course].sort((a, b) => (b.courseId || 0) - (a.courseId || 0));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                강좌 관리
                            </h1>
                            <p className="text-gray-500">
                                전체 강좌 목록을 관리하고 승인 상태를 변경할 수 있습니다.
                            </p>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <LayoutGrid className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{course.length}</div>
                                    <div className="text-xs text-gray-500 font-medium">전체 강좌</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <BookCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {course.filter(item => item.proposalStatus === 'APPROVED').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 완료</div>
                                </div>
                            </Card>
                            <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 border-amber-100">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <ClipboardList className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {course.filter(item => item.proposalStatus === 'PENDING').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 대기</div>
                                </div>
                            </Card>
                        </div>

                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow>
                                        <TableHead className="text-center w-[80px] text-gray-600 font-bold">ID</TableHead>
                                        <TableHead className="text-gray-600 font-bold">강좌 정보</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">강사명</TableHead>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">난이도</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((item, index) => {
                                            const uniqueKey = item.courseId || `course-idx-${index}`;
                                            return (
                                                <TableRow key={uniqueKey} className="hover:bg-gray-50/50 transition-colors h-20">
                                                    <TableCell className="text-center font-mono text-xs text-gray-400">
                                                        {item.courseId}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                                {item.thumbnailUrl ? (
                                                                    <img
                                                                        src={item.thumbnailUrl}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                        <LayoutGrid className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <button
                                                                    onClick={() => navigate(`/admin/course/${item.courseId}`)}
                                                                    className="font-bold text-gray-900 hover:text-primary transition-colors truncate flex items-center gap-2 text-left"
                                                                >
                                                                    {item.title}
                                                                    {isNewCourse(item.createdAt) && (
                                                                        <Badge className="h-4 px-1.5 text-[8px] font-bold bg-amber-500 text-white border-0">NEW</Badge>
                                                                    )}
                                                                </button>
                                                                <span className="text-xs text-gray-500 truncate">{item.description}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-gray-700">
                                                        {item.instructorName}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.level === 1 ? (
                                                            <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50/50 font-normal">초급</Badge>
                                                        ) : item.level === 2 ? (
                                                            <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/50 font-normal">중급</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-gray-600 border-gray-100 bg-gray-50/50 font-normal">고급</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.proposalStatus === 'PENDING' ? (
                                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">승인 대기</Badge>
                                                        ) : item.proposalStatus === 'APPROVED' ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">승인 완료</Badge>
                                                        ) : (
                                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">반려됨</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-gray-400">
                                                등록된 강좌가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={page === currentPage}
                                                    onClick={() => handlePageChange(page)}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );

}

export default AdminCourseList;