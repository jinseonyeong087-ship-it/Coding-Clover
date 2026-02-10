import React, { useState, useEffect } from "react";
import AdminNav from '@/components/AdminNav';
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
import { Search, UserX } from "lucide-react";

function AdminEnrollmentManagement() {
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

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
    const handleCancelEnrollment = async (enrollmentId, userName, courseTitle) => {
        if (!confirm(`${userName}님의 "${courseTitle}" 수강을 강제취소하시겠습니까?`)) {
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

        setFilteredEnrollments(filtered);
    };

    useEffect(() => {
        fetchAllEnrollments();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchKeyword, statusFilter, enrollments]);

    // 상태 뱃지 렌더링
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'ENROLLED':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">수강중</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="text-red-500 border-red-500/30">취소됨</Badge>;
            case 'COMPLETED':
                return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">완료</Badge>;
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
            <AdminNav />
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] bg-background">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                            수강 관리
                        </h1>
                        <p className="text-muted-foreground">
                            전체 수강내역을 조회하고 관리할 수 있습니다.
                        </p>
                    </div>
                    <Button onClick={handleReset} variant="outline">
                        초기화
                    </Button>
                </div>

                {/* 검색 및 필터 */}
                <Card className="p-4 mb-6 bg-background/60 backdrop-blur-xl border-border/50">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="수강생명 또는 강좌명으로 검색..."
                                className="pl-9"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-[180px] px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="ALL">전체 상태</option>
                            <option value="ENROLLED">수강중</option>
                            <option value="COMPLETED">완료</option>
                            <option value="CANCELLED">취소됨</option>
                        </select>
                    </div>
                </Card>

                {/* 수강내역 테이블 */}
                <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-center w-[80px]">ID</TableHead>
                                <TableHead className="text-center">수강생</TableHead>
                                <TableHead className="text-center">강좌명</TableHead>
                                <TableHead className="text-center w-[120px]">수강일시</TableHead>
                                <TableHead className="text-center w-[100px]">상태</TableHead>
                                <TableHead className="text-center w-[100px]">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16">
                                        로딩중...
                                    </TableCell>
                                </TableRow>
                            ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
                                filteredEnrollments.map((item, index) => {
                                    const uniqueKey = item.enrollmentId || `enrollment-idx-${index}`;
                                    return (
                                        <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {item.enrollmentId}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {item.userName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="max-w-[300px] truncate mx-auto">
                                                    {item.courseTitle}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {formatDate(item.enrolledAt)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {renderStatusBadge(item.status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.status === 'ENROLLED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 px-2"
                                                        onClick={() => handleCancelEnrollment(
                                                            item.enrollmentId,
                                                            item.userName,
                                                            item.courseTitle
                                                        )}
                                                    >
                                                        <UserX className="h-3 w-3 mr-1" />
                                                        취소
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                        {searchKeyword || statusFilter !== "ALL" 
                                            ? "검색 조건에 맞는 수강내역이 없습니다."
                                            : "등록된 수강내역이 없습니다."
                                        }
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* 통계 정보 */}
                {filteredEnrollments.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{filteredEnrollments.length}</div>
                                <div className="text-sm text-muted-foreground">총 수강내역</div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-500">
                                    {filteredEnrollments.filter(e => e.status === 'ENROLLED').length}
                                </div>
                                <div className="text-sm text-muted-foreground">수강중</div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-500">
                                    {filteredEnrollments.filter(e => e.status === 'COMPLETED').length}
                                </div>
                                <div className="text-sm text-muted-foreground">완료</div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-500">
                                    {filteredEnrollments.filter(e => e.status === 'CANCELLED').length}
                                </div>
                                <div className="text-sm text-muted-foreground">취소됨</div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            <Tail />
        </>
    );
}

export default AdminEnrollmentManagement;