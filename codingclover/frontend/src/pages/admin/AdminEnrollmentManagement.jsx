import React, { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
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
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

function AdminEnrollmentManagement() {
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // 전체 수강내역 조회
    const fetchAllEnrollments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/admin/enrollment', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("수강내역 데이터 로드 성공", data);
            setEnrollments(data);
            setFilteredEnrollments(data);
        } catch (error) {
            console.error('수강내역 데이터 로딩 실패', error);
        } finally {
            setLoading(false);
        }
    };

    // 필터 초기화
    const handleReset = () => {
        setSearchKeyword("");
        setStatusFilter("ALL");
    };

    // 수강 강제취소
    const handleCancel = async (enrollmentId, studentName, courseTitle) => {
        if (!confirm(`${studentName}님의 "${courseTitle}" 수강을 강제취소하시겠습니까?`)) {
            return;
        }

        try {
            const response = await fetch(`/admin/enrollment/${enrollmentId}/cancel`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const message = await response.text();
            alert(message);

            // 목록 새로고침
            fetchAllEnrollments();
        } catch (error) {
            console.error('수강취소 실패', error);
            alert('수강취소에 실패했습니다.');
        }
    };

    // 필터링 로직
    const applyFilters = () => {
        let filtered = enrollments;

        // 검색어 필터링
        if (searchKeyword.trim()) {
            filtered = filtered.filter(item =>
                item.userName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                item.courseTitle?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        // 상태 필터링
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        // 최신순(역순) 정렬
        filtered = [...filtered].sort((a, b) => {
            const timeA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
            const timeB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            return (b.enrollmentId || 0) - (a.enrollmentId || 0);
        });

        setFilteredEnrollments(filtered);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchAllEnrollments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchKeyword, statusFilter, enrollments]);

    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentEnrollments = filteredEnrollments.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 상태 뱃지 렌더링
    const getStatusBadge = (status) => {
        switch (status) {
            case 'ENROLLED':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">수강 중</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">수료 완료</Badge>;
            case 'CANCEL_REQUESTED':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">취소 대기</Badge>;
            case 'CANCELED':
                return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">취소 완료</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
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
                                수강 신청 관리
                            </h1>
                            <p className="text-gray-500">
                                학생들의 수강 신청 현황을 파악하고 상태를 관리합니다.
                            </p>
                        </div>

                        {/* 필터 섹션 */}
                        <Card className="p-6 bg-white border-gray-200 shadow-sm mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="학생 이름 또는 강좌명 검색..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="pl-9 bg-white border-gray-200 focus:ring-primary h-11"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full md:w-[180px] h-11 bg-white border border-gray-200 rounded-md px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_0.5rem_center]"
                                >
                                    <option value="ALL">모든 상태</option>
                                    <option value="ENROLLED">수강 중</option>
                                    <option value="COMPLETED">수료 완료</option>
                                    <option value="CANCEL_REQUESTED">취소 대기</option>
                                    <option value="CANCELED">취소 완료</option>
                                </select>
                            </div>
                        </Card>

                        {/* 테이블 섹션 */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden mb-8">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow>
                                        <TableHead className="text-center w-[80px] text-gray-600 font-bold">번호</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">학생명</TableHead>
                                        <TableHead className="text-center text-gray-600 font-bold">강좌명</TableHead>
                                        <TableHead className="text-center w-[160px] text-gray-600 font-bold">신청일</TableHead>
                                        <TableHead className="text-center w-[140px] text-gray-600 font-bold">상태</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">관리</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : currentEnrollments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                                수강 신청 내역이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.enrollmentId} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="text-center font-mono text-xs text-gray-400">
                                                    {enrollment.enrollmentId}
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-gray-900">
                                                    {enrollment.userName || enrollment.studentName}
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-gray-600">
                                                    {enrollment.courseTitle}
                                                </TableCell>
                                                <TableCell className="text-center text-sm text-gray-500">
                                                    {formatDate(enrollment.enrolledAt)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(enrollment.status)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {(enrollment.status !== 'CANCELED' && enrollment.status !== 'CANCELLED') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 rounded-lg text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                            onClick={() => handleCancel(enrollment.enrollmentId, enrollment.userName || enrollment.studentName, enrollment.courseTitle)}
                                                        >
                                                            <X className="w-3.5 h-3.5 mr-1" />
                                                            강제 취소
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-white border-gray-200 text-gray-600 h-10 w-10"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-10 w-10 ${currentPage === pageNum ? "" : "bg-white border-gray-200 text-gray-600"}`}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-white border-gray-200 text-gray-600 h-10 w-10"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );
}

export default AdminEnrollmentManagement;