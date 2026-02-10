import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '@/components/AdminNav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/Table";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/Tabs";
import { Search, Filter, Download, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

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
            return '취소 - 수강취소';
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

        // 상태 필터 (결제완료, 수강신청, 환불완료, 환불거절)
        if (filters.status !== 'ALL') {
            filtered = filtered.filter(p => {
                if (filters.status === 'ENROLLMENT') {
                    // 수강신청: orderId가 COURSE_로 시작하는 경우
                    return p.orderId && p.orderId.startsWith('COURSE_');
                } else if (filters.status === 'PAID') {
                    // 결제완료: 일반적인 결제 완료 상태
                    return p.paymentStatus === 'PAID' && !(p.orderId && p.orderId.startsWith('COURSE_'));
                } else if (filters.status === 'REFUNDED') {
                    // 환불완료: 환불 상태가 APPROVED
                    return p.refundStatus === 'APPROVED';
                } else if (filters.status === 'REJECTED') {
                    // 환불거절: 환불 상태가 REJECTED
                    return p.refundStatus === 'REJECTED';
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

    // 상태 배지 색상 (Premium Styling)
    const getPaymentStatusColor = (status, statusLabel) => {
        // 라벨에 따른 색상 설정
        if (statusLabel === '수강신청') {
            return 'bg-amber-100 text-amber-700 border-amber-200';
        }
        if (statusLabel === '환불완료') {
            return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        }

        switch (status) {
            case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'REFUNDED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRefundStatusColor = (status) => {
        switch (status) {
            case 'REQUESTED': return 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse';
            case 'APPROVED': return 'bg-indigo-100 text-indigo-700 border-indigo-200'; // 환불완료는 파란색
            case 'REJECTED': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'NONE': return 'bg-slate-50 text-slate-400 border-transparent';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPaymentStatusLabel = (status, type, orderId) => {
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
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10">
                    <AdminNav />
                    <div className="container mx-auto px-4 py-16 pt-32">
                        <div className="max-w-7xl mx-auto">
                            {/* 헤더 스켈레톤 */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <span>관리자</span>
                                    <span>/</span>
                                    <span className="text-indigo-600 font-medium">결제관리</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="h-10 bg-slate-200/50 rounded-lg w-48 mb-2 animate-pulse"></div>
                                        <div className="h-5 bg-slate-100/50 rounded w-64 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 bg-slate-200/50 rounded-lg w-24 animate-pulse"></div>
                                        <div className="h-10 bg-slate-200/50 rounded-lg w-24 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* 필터 스켈레톤 */}
                            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-xl ring-1 ring-white/50">
                                <CardHeader>
                                    <div className="h-6 bg-slate-200/50 rounded w-20 animate-pulse"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-4 bg-slate-200/50 rounded w-16 animate-pulse"></div>
                                                <div className="h-10 bg-slate-100/50 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-10 bg-slate-100/50 rounded flex-1 animate-pulse"></div>
                                        <div className="h-10 bg-slate-200/50 rounded w-20 animate-pulse"></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 테이블 스켈레톤 */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl ring-1 ring-white/50">
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-100">
                                                <div className="h-4 bg-slate-200/50 rounded w-20 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-16 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-32 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-20 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-16 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-16 animate-pulse"></div>
                                                <div className="h-4 bg-slate-200/50 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <Tail />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                <AdminNav />
                <div className="container mx-auto px-4 py-16 pt-32">
                    <div className="max-w-7xl mx-auto">
                        {/* 헤더 */}
                        <div className="mb-10 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>관리자 페이지</span>
                            </div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
                                결제 관리
                            </h1>
                            <p className="text-slate-600">
                                모든 결제 및 환불 요청을 한눈에 관리하세요.
                            </p>
                        </div>

                        {/* 탭 */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/40 p-1 rounded-xl shadow-sm">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg px-6 transition-all"
                                >
                                    전체 내역
                                </TabsTrigger>
                                <TabsTrigger
                                    value="refund"
                                    className="relative data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm rounded-lg px-6 transition-all"
                                >
                                    환불 요청
                                    {refundRequestCount > 0 && (
                                        <Badge className="ml-2 bg-rose-500 text-white border-0 text-[10px] px-1.5 py-0.5 h-auto">
                                            {refundRequestCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* 필터 */}
                        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-white/50 overflow-visible">
                            <CardHeader className="pb-4 border-b border-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                                        <Filter className="w-5 h-5 text-indigo-500" />
                                        상세 검색
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        onClick={resetFilters}
                                        size="sm"
                                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        필터 초기화
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    {/* 내용(Type) 필터 */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wider">거래 내용</Label>
                                        <div className="relative">
                                            <select
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-indigo-300"
                                                value={filters.contentType}
                                                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                                            >
                                                <option value="ALL">전체</option>
                                                <option value="CHARGE">포인트 충전</option>
                                                <option value="USE">포인트 사용</option>
                                                <option value="REFUND">포인트 환불</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 상태(Status) 필터 */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wider">처리 상태</Label>
                                        <div className="relative">
                                            <select
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-indigo-300"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <option value="ALL">전체 상태</option>
                                                <option value="PAID">결제완료</option>
                                                <option value="ENROLLMENT">수강신청</option>
                                                <option value="REFUNDED">환불완료</option>
                                                <option value="REJECTED">환불거절</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 기간(Period) 필터 */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wider">조회 기간</Label>
                                        <div className="relative">
                                            <select
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-indigo-300"
                                                value={filters.period}
                                                onChange={(e) => handleFilterChange('period', e.target.value)}
                                            >
                                                <option value="1">오늘 하루</option>
                                                <option value="7">최근 7일</option>
                                                <option value="30">최근 30일</option>
                                                <option value="custom">직접 지정</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 검색 기준(SearchType) 필터 */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wider">검색 기준</Label>
                                        <div className="relative">
                                            <select
                                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-indigo-300"
                                                value={filters.searchType}
                                                onChange={(e) => handleFilterChange('searchType', e.target.value)}
                                            >
                                                <option value="student">학생명</option>
                                                <option value="course">강좌명</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 직접 지정 기간 */}
                                {filters.period === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <div className="space-y-2">
                                            <Label className="text-slate-600">시작일</Label>
                                            <Input
                                                type="date"
                                                className="bg-white border-slate-200"
                                                value={filters.startDate}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-600">종료일</Label>
                                            <Input
                                                type="date"
                                                className="bg-white border-slate-200"
                                                value={filters.endDate}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 검색 */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder={`${filters.searchType === 'student' ? '학생명' : '강좌명'}으로 검색...`}
                                            className="pl-11 h-12 bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-base rounded-xl transition-all"
                                            value={filters.searchKeyword}
                                            onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                                        />
                                    </div>
                                    <Button
                                        onClick={applyFilters}
                                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all"
                                    >
                                        검색
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 결과 요약 */}
                        <div className="mb-4 flex items-center justify-between px-2">
                            <span className="text-sm font-medium text-slate-500">
                                검색 결과: <span className="text-indigo-600 font-bold">{filteredPayments.length}</span> 건
                            </span>
                            <span className="text-xs text-slate-400">
                                ({new Date().toLocaleDateString()} 기준)
                            </span>
                        </div>

                        {/* 결제 내역 테이블 */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-white/50 overflow-hidden">
                            <CardContent className="p-0">
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-20">
                                        {error ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 mb-2">데이터 로드 실패</h3>
                                                <p className="text-slate-500 mb-6">{error}</p>
                                                <Button onClick={fetchPayments} variant="outline" className="border-slate-200">
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    다시 시도
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-500">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                    <Filter className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-700 mb-2">결제 내역이 없습니다</h3>
                                                <p>검색 조건을 변경하거나 필터를 초기화해보세요.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader className="bg-slate-50/80">
                                                <TableRow className="border-b-slate-100 hover:bg-transparent">
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[100px]">결제ID</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">학생명</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">내용</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">금액</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">상태</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">결제일시</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">환불요청일</TableHead>
                                                    <TableHead className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">액션</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentItems.map((payment) => (
                                                    <TableRow
                                                        key={payment.id}
                                                        className={`
                                                            border-b-slate-50 transition-colors hover:bg-indigo-50/30
                                                            ${payment.refundStatus === 'REQUESTED' ? 'bg-rose-50/50 hover:bg-rose-50' : ''}
                                                        `}
                                                    >
                                                        <TableCell className="text-center py-4">
                                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-xs">
                                                                {payment.paymentId}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 font-medium text-slate-700">
                                                            {payment.studentName}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 text-slate-600">
                                                            {payment.courseTitle}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4">
                                                            <span className="font-bold text-slate-800">
                                                                {payment.amount.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs text-slate-500 ml-1">원</span>
                                                        </TableCell>
                                                        <TableCell className="text-center py-4">
                                                            {payment.refundStatus !== 'NONE' ? (
                                                                <Badge variant="outline" className={`border ${getRefundStatusColor(payment.refundStatus)}`}>
                                                                    {getRefundStatusLabel(payment.refundStatus)}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className={`border ${getPaymentStatusColor(payment.paymentStatus, getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId))}`}>
                                                                    {getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId)}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 text-xs text-slate-500">
                                                            {new Date(payment.paymentDate).toLocaleString('ko-KR')}
                                                        </TableCell>
                                                        <TableCell className="text-center py-4 text-xs text-slate-500">
                                                            {payment.refundRequestDate ?
                                                                new Date(payment.refundRequestDate).toLocaleString('ko-KR') :
                                                                '-'
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-center py-4">
                                                            {payment.refundStatus === 'REQUESTED' ? (
                                                                <div className="flex gap-2 justify-center">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
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
                                                                        className="h-8 text-rose-500 border-rose-200 hover:bg-rose-50"
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
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* 페이징 */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-2 p-6 border-t border-slate-100 bg-slate-50/30">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="border-slate-200 hover:bg-white hover:text-indigo-600 disabled:opacity-50"
                                                >
                                                    이전
                                                </Button>

                                                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                                                    let pageNumber;
                                                    if (totalPages <= 10) {
                                                        pageNumber = i + 1;
                                                    } else {
                                                        const start = Math.max(1, currentPage - 5);
                                                        const end = Math.min(totalPages, start + 9);
                                                        pageNumber = start + i;
                                                        if (pageNumber > end) return null;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNumber}
                                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            className={`
                                                                w-9 h-9 rounded-lg p-0 transition-all
                                                                ${currentPage === pageNumber
                                                                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                                                                    : "border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200"}
                                                            `}
                                                        >
                                                            {pageNumber}
                                                        </Button>
                                                    );
                                                })}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="border-slate-200 hover:bg-white hover:text-indigo-600 disabled:opacity-50"
                                                >
                                                    다음
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Tail />
            </div>
        </div>
    );
}

export default PaymentManagement;