import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '../../components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/Table";
import { ArrowLeft, Coins, RefreshCw, AlertTriangle } from 'lucide-react';
import coinImg from '../../img/coin.png';

function PointsHistory() {
    const navigate = useNavigate();
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [refundStatus, setRefundStatus] = useState(null); // null, 'REQUESTED', 'COMPLETED', 'REJECTED'

    useEffect(() => {
        fetchPointsData();
    }, []);

    // 사용자 식별자 가져오기 헬퍼 함수
    const getUserIdentifier = () => {
        const storedUsers = localStorage.getItem("users");
        if (!storedUsers) return null;
        try {
            const userData = JSON.parse(storedUsers);
            return userData.loginId || userData.email || null;
        } catch {
            return null;
        }
    };

    // 트랜잭션 설명 생성
    const getTransactionDescription = (reason, paymentId) => {
        switch (reason) {
            case 'CHARGE':
                return '포인트 충전';
            case 'USE':
                return '수강 신청';
            case 'REFUND':
                return '환불 완료';
            case 'ADMIN':
                return '관리자 조정';
            default:
                return '포인트 거래';
        }
    };

    // 전체 환불 요청 함수
    const requestFullRefund = async () => {
        try {
            if (points <= 0) {
                alert('환불할 포인트가 없습니다.');
                return;
            }

            if (!confirm(`보유 포인트 ${points.toLocaleString()}P  환불을 요청하시겠습니까?`)) {
                return;
            }

            const response = await fetch('/api/payment/refund/full', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    reason: "포인트 환불 요청",
                    amount: points
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(" 환불 요청 성공:", result);
                alert('전체 환불 요청이 관리자에게 전달되었습니다. 검토 후 처리됩니다.');

                // 포인트 데이터 새로고침
                await fetchPointsData();
            } else {
                const error = await response.json();
                console.error("전체 환불 요청 실패:", error);
                alert('전체 환불 요청 실패: ' + (error.message || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error("전체 환불 요청 오류:", error);
            alert('전체 환불 요청 중 오류가 발생했습니다.');
        }
    };

    const fetchPointsData = async () => {
        try {
            setLoading(true);

            const currentIdentifier = getUserIdentifier();
            if (!currentIdentifier) {
                // throw new Error('로그인이 필요합니다.');
            }

            // 백엔드 API 호출 (지갑 잔액, 지갑 히스토리, 결제 히스토리)
            const [balanceResponse, historyResponse, paymentResponse] = await Promise.all([
                fetch('/api/wallet/balance', { method: 'GET', credentials: 'include' }),
                fetch('/api/wallet/history', { method: 'GET', credentials: 'include' }),
                fetch('/api/payment/history', { method: 'GET', credentials: 'include' })
            ]);

            console.log('Balance API 응답:', balanceResponse.status);
            console.log('History API 응답:', historyResponse.status);
            console.log('Payment API 응답:', paymentResponse.status);

            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                console.log('잔액 데이터:', balanceData);
                setPoints(balanceData.balance || balanceData.amount || 0);
            } else {
                console.warn('잔액 조회 실패');
                setPoints(0); // API 실패 시 0으로 설정
            }

            // 환불 상태 확인 로직
            let paymentData = [];
            if (paymentResponse.ok) {
                paymentData = await paymentResponse.json();
                console.log('결제 데이터:', paymentData);
                const payments = Array.isArray(paymentData) ? paymentData : [];

                // 가장 최근의 환불 관련 결제 내역 찾기
                const refundPayments = payments.filter(p => p.type === 'REFUND');
                console.log('환불 결제 내역:', refundPayments);

                if (refundPayments.length > 0) {
                    // 최신순 정렬 (ID 기준)
                    refundPayments.sort((a, b) => b.paymentId - a.paymentId);
                    const latestRefund = refundPayments[0];
                    console.log('최근 환불 내역:', latestRefund);

                    if (latestRefund.status === 'REFUND_REQUEST') {
                        setRefundStatus('REQUESTED');
                    } else {
                        // 환불 완료, 거절 등 모든 경우에 다시 요청 가능하도록 설정
                        setRefundStatus(null);
                    }
                } else {
                    setRefundStatus(null);
                }
            } else {
                console.warn('결제 내역 조회 실패, 환불 상태 초기화');
                setRefundStatus(null); // API 실패 시 환불 상태 초기화
            }

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                console.log('히스토리 데이터:', historyData);

                // 백엔드에서 배열로 반환
                const historyArr = Array.isArray(historyData) ? historyData : [];

                // 결제 내역을 기준으로 환불 여부 판단하기 위한 Map 생성
                const refundPaymentMap = new Map();
                if (Array.isArray(paymentData)) {
                    paymentData.forEach(payment => {
                        if (payment.type === 'REFUND') {
                            refundPaymentMap.set(payment.paymentId, payment);
                        }
                    });
                }

                // 월렛히스토리 엔티티 필드에 맞게 매핑
                const mappedHistory = historyArr.map(item => {
                    console.log('원본 데이터:', item); // 디버깅용

                    // 타입 결정 로직 개선 - 결제 내역을 참조
                    let type = item.reason;

                    // paymentId가 있고 해당 결제가 환불 타입인지 확인
                    if (item.paymentId && refundPaymentMap.has(item.paymentId)) {
                        type = 'REFUND';
                    } else if (item.reason === 'REFUND') {
                        type = 'REFUND';
                    } else if (item.reason === 'CHARGE') {
                        type = 'CHARGE';
                    } else if (item.reason === 'USE') {
                        type = 'USE';
                    }

                    // 최종 설명 생성
                    const description = getTransactionDescription(type, item.paymentId);

                    console.log('매핑된 데이터:', { type, amount: item.changeAmount, description }); // 디버깅용

                    return {
                        id: item.walletHistoryId,
                        type: type,
                        amount: item.changeAmount,
                        description: description,
                        date: item.createdAt,
                        orderId: item.paymentId ? `ORDER-${item.paymentId}` : `TXN-${item.walletHistoryId}`,
                        status: 'COMPLETED'
                    };
                });

                setHistory(mappedHistory);
            } else {
                console.warn('히스토리 조회 실패');
                setHistory([]); // API 실패 시 빈 배열로 설정
            }


        } catch (error) {
            console.error('데이터 조회 실패:', error);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
            setRefundStatus(null); // 오류 시 환불 상태도 초기화
            setPoints(0); // 오류 시 포인트 0으로 설정
            setHistory([]); // 오류 시 빈 배열로 설정
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type, amount) => {
        if (type === 'CHARGE') return 'bg-green-100 text-green-800';
        if (type === 'REFUND') return 'bg-blue-100 text-blue-800';
        if (type === 'USE') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'CHARGE': return '충전';
            case 'USE': return '사용';
            case 'REFUND': return '환불';
            default: return '기타';
        }
    };

    // 금액 포맷
    const formatAmount = (amount) => {
        return amount ? amount.toLocaleString() : '0';
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 버튼 렌더링 헬퍼
    const renderRefundButton = () => {
        console.log('현재 포인트:', points, '환불 상태:', refundStatus);

        if (refundStatus === 'REQUESTED') {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 bg-orange-50 cursor-not-allowed"
                    disabled={true}
                >
                    환불 대기중
                </Button>
            );
        } else {
            // 환불 완료 상태 제거 - 완료되면 다시 환불 요청 가능
            // 포인트가 0보다 클 때만 활성화
            const isDisabled = points <= 0;
            return (
                <Button
                    onClick={requestFullRefund}
                    variant="outline"
                    size="sm"
                    className={isDisabled ? "text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed" : "text-red-600 border-red-300 hover:bg-red-50"}
                    disabled={isDisabled}
                >
                    환불 요청
                </Button>
            );
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Nav />
                <div className="container mx-auto px-4 py-16 pt-32">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    </div>
                </div>
                <Tail />
            </div>
        );
    }

    // 페이지네이션 로직 (로딩 후 계산)
    const safeHistory = Array.isArray(history) ? history : [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = safeHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(safeHistory.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-white">
            <Nav />
            <div className="container mx-auto px-4 py-16 pt-32">
                <div className="max-w-6xl mx-auto">
                    {/* 헤더 */}
                    <div className="mb-8">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">포인트 내역</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 현재 포인트 카드 */}
                    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">보유 포인트</h3>
                            </div>
                            <div className="text-4xl font-bold text-blue-600">
                                {points.toLocaleString()}
                                <span className="text-xl ml-1">P</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-gray-600">
                                    환불은 보유 포인트 내에서만 가능합니다
                                </p>
                                {renderRefundButton()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 포인트 내역 테이블 */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>포인트 사용 내역</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>

                            {currentItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    포인트 사용 내역이 없습니다.
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-left">일시</TableHead>
                                                <TableHead className="text-center">구분</TableHead>
                                                <TableHead className="text-center">내용</TableHead>
                                                <TableHead className="text-center">금액</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium text-left">
                                                        {new Date(item.date).toLocaleString('ko-KR')}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={getTypeColor(item.type)}>
                                                            {getTypeLabel(item.type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">{item.description}</TableCell>
                                                    <TableCell className={`text-center font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {formatAmount(item.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* 페이징 컨트롤 */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-6">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                이전
                                            </Button>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                                <Button
                                                    key={pageNumber}
                                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className="min-w-[2rem]"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            ))}

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
        </div>
    );
}

export default PointsHistory;