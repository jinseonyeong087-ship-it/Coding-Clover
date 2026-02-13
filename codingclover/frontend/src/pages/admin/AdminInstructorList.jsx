import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { BookOpen, Users, UserCheck, ShieldAlert, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext, 
} from "@/components/ui/pagination";

function AdminInstructorList() {

    const [status, setStatus] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('ALL'); // 필터 상태 추가
    const itemsPerPage = 15;

    useEffect(() => {
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
    }, [])

    // 필터링 로직
    const getFilteredInstructors = () => {
        switch (filter) {
            case 'APPROVED':
                return status.filter(u => u.profileStatus === 'APPROVED');
            case 'APPLIED':
                return status.filter(u => u.profileStatus === 'APPLIED');
            case 'REJECTED':
                return status.filter(u => u.profileStatus === 'REJECTED');
            default:
                return status;
        }
    };

    // 필터 변경 핸들러
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    };

    // Sorting and Pagination Logic
    const filteredInstructors = getFilteredInstructors();
    const sortedInstructors = [...filteredInstructors].sort((a, b) => (b.userId || 0) - (a.userId || 0));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedInstructors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedInstructors.length / itemsPerPage);

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
                                강사 관리
                            </h1>
                            <p className="text-gray-500">
                                강사 목록을 관리하고 승인 상태를 변경할 수 있습니다.
                            </p>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${
                                    filter === 'ALL' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                                }`}
                                onClick={() => handleFilterChange('ALL')}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{status.length}</div>
                                    <div className="text-xs text-gray-500 font-medium">전체 강사</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${
                                    filter === 'APPROVED' ? 'ring-2 ring-emerald-500 shadow-lg' : ''
                                }`}
                                onClick={() => handleFilterChange('APPROVED')}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <UserCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {status.filter(u => u.profileStatus === 'APPROVED').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 완료</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 border-amber-100 cursor-pointer hover:shadow-md transition-all ${
                                    filter === 'APPLIED' ? 'ring-2 ring-amber-500 shadow-lg' : ''
                                }`}
                                onClick={() => handleFilterChange('APPLIED')}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <ShieldAlert className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {status.filter(u => u.profileStatus === 'APPLIED').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">승인 대기</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 border-rose-100 cursor-pointer hover:shadow-md transition-all ${
                                    filter === 'REJECTED' ? 'ring-2 ring-rose-500 shadow-lg' : ''
                                }`}
                                onClick={() => handleFilterChange('REJECTED')}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {status.filter(u => u.profileStatus === 'REJECTED').length}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">반려됨</div>
                                </div>
                            </Card>
                        </div>

                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow>
                                        <TableHead className="text-center w-[100px] text-gray-600 font-bold">번호</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">강사명</TableHead>
                                        <TableHead className="text-center w-[150px] text-gray-600 font-bold">상태</TableHead>
                                        <TableHead className="text-center w-[150px] text-gray-600 font-bold">관리</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((users, index) => {
                                            const uniqueKey = users.userId || `user-idx-${index}`;
                                            return (
                                                <TableRow key={uniqueKey} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="text-center font-mono text-xs text-gray-400">{users.userId}</TableCell>
                                                    <TableCell className="text-center font-bold text-gray-900">
                                                        <Link to={`/admin/users/instructors/${users.userId}`} className="hover:text-primary transition-colors">
                                                            {users.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {users.profileStatus === 'APPROVED' ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">승인 완료</Badge>
                                                        ) : users.profileStatus === 'APPLIED' ? (
                                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">승인 대기</Badge>
                                                        ) : users.profileStatus === 'REJECTED' ? (
                                                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">반려됨</Badge>
                                                        ) : (
                                                            <Badge variant="outline">미신청</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Link to={`/admin/users/instructors/${users.userId}/courses`}>
                                                            <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-8 px-3 rounded-lg text-xs">
                                                                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                                                강좌 목록
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-gray-400">
                                                {filter === 'ALL' 
                                                    ? '등록된 강사가 없습니다.' 
                                                    : `해당 조건에 맞는 강사가 없습니다.`}
                                            </TableCell>
                                        </TableRow>)}
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

export default AdminInstructorList;