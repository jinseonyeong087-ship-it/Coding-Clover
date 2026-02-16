import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import AdminSidebar from "@/components/AdminSidebar";
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
    Video,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Search,
    XCircle
} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
} from "@/components/ui/pagination";

function AdminLectureList() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState(null); // null = 전체, 'APPROVED', 'PENDING', 'REJECTED'
    const itemsPerPage = 15;

    const fetchLectures = () => {
        setLoading(true);
        fetch('/admin/lectures', {
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
                console.log("강의 데이터 로드 성공", resData);
                let data = [];
                if (Array.isArray(resData)) {
                    data = resData;
                } else if (resData && typeof resData === 'object') {
                    const list = resData.content || resData.list || [resData];
                    data = Array.isArray(list) ? list : [list];
                }
                setLectures(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('강의 데이터 로딩 실패', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLectures();
    }, []);

    const stats = {
        total: lectures.length,
        approved: lectures.filter(l => l.approvalStatus === 'APPROVED').length,
        pending: lectures.filter(l => l.approvalStatus === 'PENDING').length,
        rejected: lectures.filter(l => l.approvalStatus === 'REJECTED').length
    };

    const getApprovalBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-0 font-bold">승인 대기</Badge>;
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold">승인 완료</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 border-0 font-bold">반려됨</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec > 0 ? sec + '초' : ''}`.trim();
    };

    // Filtering, Sorting and Pagination Logic
    const filteredLectures = statusFilter 
        ? lectures.filter(l => l.approvalStatus === statusFilter)
        : lectures;
    const sortedLectures = [...filteredLectures].sort((a, b) => (b.lectureId || 0) - (a.lectureId || 0));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedLectures.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedLectures.length / itemsPerPage);

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
                        {/* 헤더 */}
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">강의 관리</h1>
                            <p className="text-gray-500">전체 강의 목록을 관리하고 승인 처리를 진행합니다.</p>
                        </div>

                        {/* 퀵 스탯 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${
                                    statusFilter === null ? 'ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => {
                                    setStatusFilter(null);
                                    setCurrentPage(1);
                                }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Video className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                                    <div className="text-xs text-gray-500 font-medium">전체 강의</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${
                                    statusFilter === 'APPROVED' ? 'ring-2 ring-emerald-500' : ''
                                }`}
                                onClick={() => {
                                    setStatusFilter('APPROVED');
                                    setCurrentPage(1);
                                }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
                                    <div className="text-xs text-gray-500 font-medium">승인 완료</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${
                                    statusFilter === 'PENDING' ? 'ring-2 ring-amber-500' : ''
                                }`}
                                onClick={() => {
                                    setStatusFilter('PENDING');
                                    setCurrentPage(1);
                                }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                                    <div className="text-xs text-gray-500 font-medium">승인 대기</div>
                                </div>
                            </Card>
                            <Card 
                                className={`p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4 border-red-100 cursor-pointer transition-all hover:shadow-md ${
                                    statusFilter === 'REJECTED' ? 'ring-2 ring-red-500' : ''
                                }`}
                                onClick={() => {
                                    setStatusFilter('REJECTED');
                                    setCurrentPage(1);
                                }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
                                    <div className="text-xs text-gray-500 font-medium">반려됨</div>
                                </div>
                            </Card>
                        </div>

                        {/* 리스트 카드 */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[60px]">No.</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">강좌 정보</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">강의명</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[120px]">강사</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[80px]">순서</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">재생시간</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">상태</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[80px]">상세</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 8 }).map((_, j) => (
                                                    <TableCell key={j} className="py-4">
                                                        <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-12"></div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (currentItems && currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <TableRow key={item.lectureId} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="text-center text-sm text-gray-400">
                                                    {item.lectureId}
                                                </TableCell>
                                                <TableCell className="text-center text-sm font-medium text-gray-600">
                                                    {item.courseTitle || '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-gray-900">{item.title}</span>
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {item.instructorName || '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-sm font-medium text-gray-500">
                                                    {item.orderNo != null ? item.orderNo : '-'}
                                                </TableCell>
                                                <TableCell className="text-center text-sm text-gray-500">
                                                    {formatDuration(item.duration)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getApprovalBadge(item.approvalStatus)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-gray-400 hover:text-primary">
                                                        <Link to={`/admin/lectures/${item.lectureId}`}>
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20">
                                                <div className="flex flex-col items-center text-gray-400">
                                                    <Search className="w-10 h-10 mb-3 opacity-20" />
                                                    <p className="font-medium">등록된 강의가 없습니다.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination */}
                        {totalPages >= 1 && (
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

export default AdminLectureList;
