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
import { Search, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';

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

    // 상태 배지 색상
    const getPaymentStatusColor = (status, statusLabel) => {
        // 라벨에 따른 색상 설정
        if (statusLabel === '수강신청') {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (statusLabel === '환불완료') {
            return 'bg-blue-100 text-blue-800';
        }
        
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            case 'REFUNDED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRefundStatusColor = (status) => {
        switch (status) {
            case 'REQUESTED': return 'bg-red-100 text-red-800';
            case 'APPROVED': return 'bg-blue-100 text-blue-800'; // 환불완료는 파란색
            case 'REJECTED': return 'bg-gray-100 text-gray-800';
            case 'NONE': return 'bg-gray-50 text-gray-500';
            default: return 'bg-gray-100 text-gray-800';
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

    // 환불 요청 건수
    const refundRequestCount = payments.filter(p => p.refundStatus === 'REQUESTED').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNav />
                <div className="container mx-auto px-4 py-16 pt-32">
                    <div className="max-w-7xl mx-auto">
                        {/* 헤더 스켈레톤 */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <span>관리자</span>
                                <span>/</span>
                                <span className="text-blue-600">결제관리</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-100 rounded w-48 animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* 필터 스켈레톤 */}
                        <Card className="mb-6">
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
                                <div className="flex gap-2">
                                    <div className="h-10 bg-gray-100 rounded flex-1 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 테이블 스켈레톤 */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="p-6">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Tail />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <AdminNav />
            <div className="container mx-auto px-4 py-16 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">결제관리</h1>
                            </div>
                        </div>
                    </div>

                    {/* 탭 */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="refund" className="relative">
                                환불요청
                                {refundRequestCount > 0 && (
                                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                                        {refundRequestCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* 필터 */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    필터
                                </CardTitle>
                                <Button variant="outline" onClick={resetFilters} size="sm">
                                    초기화
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {/* 내용 필터 */}
                                <div>
                                    <Label>내용</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.contentType}
                                        onChange={(e) => handleFilterChange('contentType', e.target.value)}
                                    >
                                        <option value="ALL">전체</option>
                                        <option value="CHARGE">포인트 충전</option>
                                        <option value="USE">포인트 사용</option>
                                        <option value="REFUND">포인트 환불</option>
                                    </select>
                                </div>

                                {/* 상태 필터 */}
                                <div>
                                    <Label>상태</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="ALL">전체</option>
                                        <option value="PAID">결제완료</option>
                                        <option value="ENROLLMENT">수강신청</option>
                                        <option value="REFUNDED">환불완료</option>
                                        <option value="REJECTED">환불거절</option>
                                    </select>
                                </div>

                                {/* 기간 */}
                                <div>
                                    <Label>기간</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.period}
                                        onChange={(e) => handleFilterChange('period', e.target.value)}
                                    >
                                        <option value="1">오늘</option>
                                        <option value="7">7일</option>
                                        <option value="30">30일</option>
                                        <option value="custom">직접 지정</option>
                                    </select>
                                </div>

                                {/* 검색 타입 */}
                                <div>
                                    <Label>검색 대상</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filters.searchType}
                                        onChange={(e) => handleFilterChange('searchType', e.target.value)}
                                    >
                                        <option value="student">학생명</option>
                                        <option value="course">강좌명</option>
                                    </select>
                                </div>
                            </div>

                            {/* 직접 지정 기간 */}
                            {filters.period === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label>시작일</Label>
                                        <Input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>종료일</Label>
                                        <Input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 검색 */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`${filters.searchType === 'student' ? '학생명' : '강좌명'}으로 검색...`}
                                        className="pl-9"
                                        value={filters.searchKeyword}
                                        onChange={(e) => handleFilterChange('searchKeyword', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                </div>
                                <Button onClick={applyFilters}>
                                    검색
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 결과 요약 */}
                    <div className="mb-4 text-sm text-gray-600">
                        총 {filteredPayments.length}건의 결과 ({currentItems.length}건 표시 중)
                    </div>

                    {/* 결제 내역 테이블 */}
                    <Card>
                        <CardContent className="p-0">
                            {currentItems.length === 0 ? (
                                <div className="text-center py-12">
                                    {error ? (
                                        <div className="text-red-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                            <p className="mb-4">{error}</p>
                                            <Button onClick={fetchPayments} variant="outline">
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                다시 시도
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            결제 내역이 없습니다.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center">결제ID</TableHead>
                                                <TableHead className="text-center">학생명</TableHead>
                                                <TableHead className="text-center">내용</TableHead>
                                                <TableHead className="text-center">금액</TableHead>
                                                <TableHead className="text-center">상태</TableHead>
                                                <TableHead className="text-center">결제일시</TableHead>
                                                <TableHead className="text-center">환불요청일</TableHead>
                                                <TableHead className="text-center">액션</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.map((payment) => (
                                                <TableRow key={payment.id} className={payment.refundStatus === 'REQUESTED' ? 'bg-red-50' : ''}>
                                                    <TableCell className="text-center font-mono text-sm">
                                                        {payment.paymentId}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {payment.studentName}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {payment.courseTitle}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {payment.amount.toLocaleString()}원
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {payment.refundStatus !== 'NONE' ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Badge className={getRefundStatusColor(payment.refundStatus)}>
                                                                    {getRefundStatusLabel(payment.refundStatus)}
                                                                </Badge>
                                                            </div>
                                                        ) : (
                                                            <Badge className={getPaymentStatusColor(payment.paymentStatus, getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId))}>
                                                                {getPaymentStatusLabel(payment.paymentStatus, payment.type, payment.orderId)}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {new Date(payment.paymentDate).toLocaleString('ko-KR')}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {payment.refundRequestDate ?
                                                            new Date(payment.refundRequestDate).toLocaleString('ko-KR') :
                                                            '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {payment.refundStatus === 'REQUESTED' ? (
                                                            <div className="flex gap-2 justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 border-green-300 hover:bg-green-50"
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
                                                                    className="text-red-600 border-red-300 hover:bg-red-50"
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
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* 페이징 */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 p-6 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
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
                                                        className="min-w-[2rem]"
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
        </div >
    );
}

export default PaymentManagement;