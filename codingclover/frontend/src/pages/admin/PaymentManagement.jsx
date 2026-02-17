import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import AdminSidebar from '@/components/AdminSidebar';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Search, Filter, RefreshCw, AlertCircle, AlertTriangle, CreditCard, XCircle } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

function PaymentManagement() {
    const navigate = useNavigate();

    // 상태 관리
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true); // 초기에 true로 설정
    const [error, setError] = useState(null);

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // 필터
    const [filters, setFilters] = useState({
        contentType: 'ALL', // 내용 필터 (포인트 충전, 사용, 환불)
        status: 'ALL', // 상태 필터 (결제완료, 수강신청, 환불완료 등)
        period: '7', // 기본값을 7일로 설정
        startDate: '',
        endDate: '',
        searchKeyword: '',
        searchType: 'student' // student, course
    });

    // 탭
    const [activeTab, setActiveTab] = useState('all');

    // 탭 변경 처리 (환불요청 탭 클릭시 필터 초기화)
    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        if (tabValue === 'refund') {
            setFilters({
                contentType: 'ALL',
                status: 'ALL',
                period: '7',
                startDate: '',
                endDate: '',
                searchKeyword: '',
                searchType: 'student'
            });
        }
    };

    // 데이터 로드
    useEffect(() => {
        fetchPayments();
    }, []);

    // 필터 적용 (수동 검색)
    useEffect(() => {
        // 초기 로드시에만 필터 적용
        if (payments.length > 0) {
            applyFilters();
        }
    }, [payments, activeTab]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            // timeout을 추가하여 빠른 에러 처리
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 timeout

            const response = await fetch('/api/payment/admin/payments', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            console.log('Received payment data:', data);

            // 데이터가 비어있으면 빠른 처리
            if (!data || data.length === 0) {
                setPayments([]);
                return;
            }

            // 백엔드 데이터를 프론트엔드 형식으로 변환
            const formattedPayments = data.map(payment => ({
                id: payment.paymentId,
                paymentId: `PAY-${payment.paymentId.toString().padStart(3, '0')}`,
                studentName: payment.studentName,
                studentId: payment.studentLoginId,
                courseTitle: payment.courseTitle || getTransactionDescription(payment.type, payment.orderId),
                amount: payment.amount,
                type: payment.type, // type 정보 추가
                orderId: payment.orderId, // orderId 정보 추가
                paymentStatus: getPaymentStatus(payment.type, payment.status),
                refundStatus: getRefundStatus(payment.type, payment.status),
                paymentDate: payment.paidAt,
                refundRequestDate: payment.type === 'REFUND' ? payment.paidAt : null,
                refundAmount: payment.type === 'REFUND' ? payment.amount : 0
            }));

            setPayments(formattedPayments);
        } catch (error) {
            if (error.name === 'AbortError') {
                setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            } else {
                console.error('결제 데이터 조회 실패:', error);
                setError('결제 데이터를 불러오는데 실패했습니다.');
            }
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    // 백엔드 데이터 변환 헬퍼 함수들
    const getTransactionDescription = (type, orderId) => {
        if (orderId && orderId.startsWith('COURSE_CANCEL_')) {
            return '포인트 환불';
        }
        // 수강신청인 경우 (orderId가 COURSE_로 시작)
        if (orderId && orderId.startsWith('COURSE_')) {
            return '포인트 사용';
        }

        switch (type) {
            case 'CHARGE': return '포인트 충전';
            case 'USE': return '포인트 사용';
            case 'REFUND': return '포인트 환불';
            default: return '알 수 없음';
        }
    };

    const getPaymentStatus = (type, status) => {
        if (status === 'PAID') return 'PAID';
        if (status === 'REFUND_REQUEST') return 'CANCELLED';
        if (status === 'REFUNDED') return 'REFUNDED';
        return 'PAID';
    };

    const getRefundStatus = (type, status) => {
        if (status === 'REFUND_REQUEST') return 'REQUESTED';
        if (status === 'REFUNDED') return 'APPROVED';
        if (status === 'REJECTED') return 'REJECTED';
        return 'NONE';
    };

    const applyFilters = () => {
        let filtered = [...payments];

        // 탭 필터
        if (activeTab === 'refund') {
            filtered = filtered.filter(p => p.refundStatus === 'REQUESTED');
        }

        // 내용 필터 (type 기반)
        if (filters.contentType !== 'ALL') {
            filtered = filtered.filter(p => p.type === filters.contentType);
        }

        // 상태 필터 (결제완료, 수강신청, 환불완료, 환불거절, 수강취소)
        if (filters.status !== 'ALL') {
            filtered = filtered.filter(p => {
                if (filters.status === 'ENROLLMENT') {
                    // 수강신청: orderId가 COURSE_로 시작하고 paymentStatus가 PAID인 경우
                    return p.orderId && p.orderId.startsWith('COURSE_') && p.paymentStatus === 'PAID' && !p.orderId.includes('CANCEL');
                } else if (filters.status === 'PAID') {
                    // 결제완료: paymentStatus가 PAID이면서 수강신청, 수강취소, 환불거절이 아닌 경우 (포인트 충전)
                    return p.paymentStatus === 'PAID' &&
                        !(p.orderId && p.orderId.startsWith('COURSE_')) &&
                        !(p.orderId && p.orderId.startsWith('COURSE_CANCEL_')) &&
                        p.refundStatus !== 'REJECTED';
                } else if (filters.status === 'REFUNDED') {
                    // 환불완료: 환불 상태가 APPROVED
                    return p.refundStatus === 'APPROVED';
                } else if (filters.status === 'REJECTED') {
                    // 환불거절: 환불 상태가 REJECTED
                    return p.refundStatus === 'REJECTED';
                } else if (filters.status === 'CANCELLED') {
                    // 수강취소: orderId가 COURSE_CANCEL_로 시작하는 경우만
                    return p.orderId && p.orderId.startsWith('COURSE_CANCEL_');
                }
                return false;
            });
        }

        // 기간 필터
        const now = new Date();
        if (filters.period !== 'custom') {
            const days = parseInt(filters.period);
            if (days > 0) {
                if (days === 1) {
                    // 오늘의 경우 - 정확히 오늘 날짜만
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    filtered = filtered.filter(p => {
                        const paymentDate = new Date(p.paymentDate);
                        return paymentDate >= today && paymentDate < tomorrow;
                    });
                } else {
                    // 다른 기간의 경우
                    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                    filtered = filtered.filter(p => new Date(p.paymentDate) >= startDate);
                }
            }
        } else if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate + ' 23:59:59');
            filtered = filtered.filter(p => {
                const paymentDate = new Date(p.paymentDate);
                return paymentDate >= start && paymentDate <= end;
            });
        }

        // 검색 필터
        if (filters.searchKeyword) {
            const keyword = filters.searchKeyword.toLowerCase();
            filtered = filtered.filter(p => {
                if (filters.searchType === 'student') {
                    return p.studentName.toLowerCase().includes(keyword);
                } else {
                    return p.courseTitle.toLowerCase().includes(keyword);
                }
            });
        }

        // 최신순 정렬
        filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        setFilteredPayments(filtered);
        setCurrentPage(1); // 필터 변경 시 첫 페이지로
    };

    // 페이징 계산
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredPayments.slice(startIndex, endIndex);

    // 페이지 변경
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 필터 변경
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // 필터 초기화
    const resetFilters = () => {
        // 페이지 로드 시와 동일한 기본 상태로 복원
        setFilters({
            contentType: 'ALL',
            status: 'ALL',
            period: '7', // 기본값 7일
            startDate: '',
            endDate: '',
            searchKeyword: '',
            searchType: 'student'
        });

        // 탭도 기본값으로 초기화
        setActiveTab('all');

        // 페이지도 첫 페이지로 초기화
        setCurrentPage(1);

        // 초기 로드 시와 동일한 필터링 적용 (7일 기간, 전체 탭)
        let filtered = [...payments];

        // 기본 7일 기간 필터 적용
        const now = new Date();
        const days = 7;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(p => new Date(p.paymentDate) >= startDate);

        // 최신순 정렬
        filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        setFilteredPayments(filtered);
    };

    const getPaymentStatusLabel = (status, type, orderId) => {
        // 수강취소인 경우 (orderId가 COURSE_CANCEL_로 시작)
        if (orderId && orderId.startsWith('COURSE_CANCEL_')) {
            return '수강취소';
        }
        // 수강신청인 경우 (orderId가 COURSE_로 시작)
        if (orderId && orderId.startsWith('COURSE_')) {
            return '수강신청';
        }

        switch (status) {
            case 'PAID': return '결제완료';
            case 'CANCELLED': return '결제취소';
            case 'REFUNDED': return '환불완료';
            default: return status;
        }
    };

    const getRefundStatusLabel = (status) => {
        switch (status) {
            case 'REQUESTED': return '환불요청';
            case 'APPROVED': return '환불완료';
            case 'REJECTED': return '환불거절';
            case 'NONE': return '없음';
            default: return status;
        }
    };

    // 환불 승인
    const handleRefundApproval = async (paymentId) => {
        try {
            const response = await fetch(`/api/payment/admin/refund/approve/${paymentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                alert('환불이 승인되었습니다.');
                await fetchPayments(); // 데이터 새로고침
            } else {
                const error = await response.json();
                alert('환불 승인 실패: ' + (error.message || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('환불 승인 중 오류 발생:', error);
            alert('환불 승인 중 오류가 발생했습니다.');
        }
    };

    // 환불 거절
    const handleRefundReject = async (paymentId) => {
        try {
            const response = await fetch(`/api/payment/admin/refund/reject/${paymentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                alert('환불이 거절되었습니다.');
                await fetchPayments(); // 데이터 새로고침
            } else {
                const error = await response.json();
                alert('환불 거절 실패: ' + (error.message || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('환불 거절 중 오류 발생:', error);
            alert('환불 거절 중 오류가 발생했습니다.');
        }
    };

    const refundRequestCount = payments.filter(p => p.refundStatus === 'REQUESTED').length;

    if (loading) {
        return (
            <>
                <Nav />
                <div className="min-h-screen bg-gray-50 pt-20 pb-20">
                    <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">
                        <AdminSidebar />
                        <main className="flex-1 min-w-0">
                            {/* 헤더 스켈레톤 */}
                            <div className="mb-8">
                                <div className="h-10 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
                                <div className="h-5 bg-gray-100 rounded w-64 animate-pulse"></div>
                            </div>

                            {/* 필터 스켈레톤 */}
                            <Card className="mb-6 border-gray-200 bg-white shadow-sm">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                                <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                                </CardContent>
                            </Card>

                            {/* 테이블 스켈레톤 */}
                            <Card className="border-gray-200 bg-white shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-6 space-y-4">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className="h-12 bg-gray-50 rounded animate-pulse"></div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </main>
                    </div>
                </div>
                <Tail />
            </>
        );
    }

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                결제 및 정산 관리
                            </h1>
                            <p className="text-gray-500">
                                모든 결제 내역과 환불 요청을 한눈에 관리하고 처리할 수 있습니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {/* 미처리 환불 요청 */}
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">신규 환불 요청</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {refundRequestCount}<span className="text-sm font-bold text-gray-400 ml-1">건</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 총 포인트 충전 합계 */}
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50">
                                        <CreditCard className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">포인트 충전 합계</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {payments.filter(p => p.type === 'CHARGE' && !p.orderId?.startsWith('COURSE_CANCEL_')).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                                            <span className="text-sm font-bold text-gray-400 ml-1">P</span>
                                            <span className="text-xs text-gray-300 ml-2">
                                                ({payments.filter(p => p.type === 'CHARGE' && !p.orderId?.startsWith('COURSE_CANCEL_')).length}건)
                                            </span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 최근 1주일 수강 취소 */}
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-50">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold mb-0.5">최근 수강 취소 (7일)</p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {payments.filter(p => {
                                                if (!p.orderId?.startsWith('COURSE_CANCEL_')) return false;
                                                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                                return new Date(p.paymentDate) >= weekAgo;
                                            }).length}
                                            <span className="text-sm font-bold text-gray-400 ml-1">건</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 탭 & 필터 카드 */}
                        <Card className="mb-8 border-gray-200 bg-white shadow-sm overflow-visible">
                            <CardHeader className="pb-0 border-b border-gray-100/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mb-px">
                                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                                        <TabsList className="bg-transparent p-0 gap-8 h-12">
                                            <TabsTrigger
                                                value="all"
                                                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 h-full font-bold"
                                            >
                                                전체 결제 내역
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="refund"
                                                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 h-full font-bold"
                                            >
                                                환불 요청 목록
                                                {refundRequestCount > 0 && (
                                                    <Badge className="ml-2 bg-red-500 text-white border-0 text-[10px] px-1.5 h-4">
                                                        {refundRequestCount}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <Button
                                        variant="ghost"
                                        onClick={resetFilters}
                                        size="sm"
                                        className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 h-8 self-end md:self-center"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                        필터 초기화
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-400 text-[11px] font-bold">거래 유형</Label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                            value={filters.contentType}
                                            onChange={(e) => handleFilterChange('contentType', e.target.value)}
                                        >
                                            <option value="ALL">전체 유형</option>
                                            <option value="CHARGE">포인트 충전</option>
                                            <option value="USE">포인트 사용</option>
                                            <option value="REFUND">포인트 환불</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-gray-400 text-[11px] font-bold">처리 상태</Label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="ALL">전체 상태</option>
                                            <option value="PAID">결제완료(충전)</option>
                                            <option value="ENROLLMENT">수강신청(사용)</option>
                                            <option value="REFUNDED">환불완료</option>
                                            <option value="REJECTED">환불거절</option>
                                            <option value="CANCELLED">수강취소</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-gray-400 text-[11px] font-bold">조회 기간</Label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                            value={filters.period}
                                            onChange={(e) => handleFilterChange('period', e.target.value)}
                                        >
                                            <option value="1">오늘</option>
                                            <option value="7">최근 7일</option>
                                            <option value="30">최근 30일</option>
                                            <option value="custom">기간 직접 지정</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-gray-400 text-[11px] font-bold">검색 기준</Label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                            value={filters.searchType}
                                            onChange={(e) => handleFilterChange('searchType', e.target.value)}
                                        >
                                            <option value="student">학생명</option>
                                            <option value="course">항목/강좌명</option>
                                        </select>
                                    </div>
                                </div>

                                {filters.period === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="space-y-1.5">
                                            <Label className="text-gray-500 text-xs">시작일</Label>
                                            <Input
                                                type="date"
                                                className="bg-white"
                                                value={filters.startDate}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-gray-500 text-xs">종료일</Label>
                                            <Input
                                                type="date"
                                                className="bg-white"
                                                value={filters.endDate}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder={`${filters.searchType === 'student' ? '학생명' : '강좌/항목명'}으로 검색...`}
                                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                            value={filters.searchKeyword}
                                            onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                                        />
                                    </div>
                                    <Button
                                        onClick={applyFilters}
                                        className="h-11 px-6 font-bold"
                                    >
                                        검색
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 결제 내역 테이블 */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-sm text-gray-500">
                                검색 결과 <span className="text-gray-900 font-bold">{filteredPayments.length}</span>건
                            </span>
                        </div>

                        <Card className="border-gray-200 bg-white shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">ID</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">학생명</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[180px]">내역 정보</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[120px]">금액(P)</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">상태</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[150px]">일시</TableHead>
                                        <TableHead className="text-center py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[100px]">관리</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20">
                                                {error ? (
                                                    <div className="flex flex-col items-center">
                                                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                                                        <p className="text-gray-500 font-medium mb-4">{error}</p>
                                                        <Button onClick={fetchPayments} variant="outline" size="sm">
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            다시 시도
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <Filter className="w-10 h-10 mb-3 opacity-20" />
                                                        <p className="font-medium">검색된 결제 내역이 없습니다.</p>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentItems.map((payment) => (
                                            <TableRow
                                                key={payment.id}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <TableCell className="text-center py-4">
                                                    <span className="font-mono text-[10px] text-gray-400">
                                                        {payment.paymentId}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-4 font-bold text-gray-900">
                                                    {payment.studentName}
                                                </TableCell>
                                                <TableCell className="text-center py-4 text-gray-600 text-sm">
                                                    {payment.courseTitle}
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    <span className="font-bold text-gray-900">
                                                        {payment.amount.toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    {payment.refundStatus !== 'NONE' ? (
                                                        <Badge className={`${payment.refundStatus === 'REQUESTED' ? 'bg-amber-100 text-amber-700' : payment.refundStatus === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'} border-0 font-bold whitespace-nowrap`}>
                                                            {getRefundStatusLabel(payment.refundStatus)}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className={`${getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId) === '수강신청' ? 'bg-blue-100 text-blue-700' :
                                                            getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId) === '수강취소' ? 'bg-red-100 text-red-700' :
                                                                'bg-emerald-100 text-emerald-700'
                                                            } border-0 font-bold whitespace-nowrap`}>
                                                            {getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId)}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center py-4 text-[11px] text-gray-400">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                                        <span>{new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center py-4">
                                                    {payment.refundStatus === 'REQUESTED' ? (
                                                        <div className="flex gap-1.5 justify-center">
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                                                                onClick={() => {
                                                                    if (confirm('환불을 승인하시겠습니까?')) {
                                                                        handleRefundApproval(payment.id);
                                                                    }
                                                                }}
                                                            >
                                                                승인
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-2.5 text-red-600 border-red-100 hover:bg-red-50 font-bold text-[11px]"
                                                                onClick={() => {
                                                                    if (confirm('환불을 거절하시겠습니까?')) {
                                                                        handleRefundReject(payment.id);
                                                                    }
                                                                }}
                                                            >
                                                                거절
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-200">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* 페이징 */}
                            {totalPages >= 1 && (
                                <div className="mt-10 mb-6">
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
                        </Card>
                    </main>
                </div>
            </div>
            <Tail />
        </>
    );
}

export default PaymentManagement;