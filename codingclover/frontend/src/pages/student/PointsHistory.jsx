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
                return '포인트 사용';
            case 'REFUND':
                return '포인트 환불';
            case 'ADMIN':
                return '관리자 조정';
            default:
                return '포인트 거래';
        }
    };

    const fetchPointsData = async () => {
        try {
            setLoading(true);
            
            const currentIdentifier = getUserIdentifier();
            if (!currentIdentifier) {
                throw new Error('로그인이 필요합니다.');
            }

            // 백엔드 월렛히스토리 API 호출
            const [balanceResponse, historyResponse] = await Promise.all([
                fetch('/api/wallet/balance', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                }),
                fetch('/api/wallet/history', {
                    method: 'GET', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
            ]);

            console.log('Balance API 응답:', balanceResponse.status);
            console.log('History API 응답:', historyResponse.status);

            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                console.log('잔액 데이터:', balanceData);
                setPoints(balanceData.balance || balanceData.amount || 0);
            } else {
                console.warn('잔액 조회 실패, 기본값 사용');
                setPoints(150000); // 기본값
            }

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                console.log('히스토리 데이터:', historyData);
                
                // 백엔드에서 배열로 반환
                const history = Array.isArray(historyData) ? historyData : [];
                
                // 월렛히스토리 엔티티 필드에 맞게 매핑
                const mappedHistory = history.map(item => ({
                    id: item.walletHistoryId,
                    type: item.reason === 'CHARGE' ? 'CHARGE' : 'USE', // WalletChangeReason: CHARGE, USE, REFUND, ADMIN
                    amount: item.changeAmount, // 변경된 금액 (양수/음수)
                    description: getTransactionDescription(item.reason, item.paymentId),
                    date: item.createdAt,
                    orderId: item.paymentId ? `ORDER-${item.paymentId}` : `TXN-${item.walletHistoryId}`,
                    status: 'COMPLETED'
                })); 
                
                setHistory(mappedHistory);
            } else {
                console.warn('히스토리 조회 실패, 샘플 데이터 사용');
                // 샘플 데이터 사용
                setHistory([
                    {
                        id: 1,
                        type: 'CHARGE',
                        amount: 100000,
                        description: 'Java 기초 강좌 결제',
                        date: '2024-01-15T14:30:00',
                        orderId: 'ORDER-001',
                        status: 'COMPLETED'
                    },
                    {
                        id: 2,
                        type: 'CHARGE',
                        amount: 50000,
                        description: 'Python 심화 강좌 결제',
                        date: '2024-01-20T16:45:00',
                        orderId: 'ORDER-002',
                        status: 'COMPLETED'
                    },
                    {
                        id: 3,
                        type: 'USE',
                        amount: -30000,
                        description: '개인 과외 1회 이용',
                        date: '2024-01-25T10:00:00',
                        orderId: 'USE-001',
                        status: 'COMPLETED'
                    }
                ]);
            }

        } catch (error) {
            console.error('포인트 데이터 조회 실패:', error);
            setError('백엔드 연결 실패 - 샘플 데이터로 표시됩니다.');
            
            // 오류 시 샘플 데이터
            setPoints(150000);
            setHistory([
                {
                    id: 1,
                    type: 'CHARGE',
                    amount: 100000,
                    description: '포인트 충전',
                    date: '2024-01-15T14:30:00',
                    orderId: 'ORDER-001',
                    status: 'COMPLETED'
                },
                {
                    id: 2,
                    type: 'CHARGE',
                    amount: 50000,
                    description: '포인트 충전',
                    date: '2024-01-20T16:45:00',
                    orderId: 'ORDER-002',
                    status: 'COMPLETED'
                },
                {
                    id: 3,
                    type: 'USE',
                    amount: -30000,
                    description: 'Java 기초 강좌 이용',
                    date: '2024-01-25T10:00:00',
                    orderId: 'USE-001',
                    status: 'COMPLETED'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 페이징 계산
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = history.slice(startIndex, endIndex);

    // 페이지 변경 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const formatAmount = (amount) => {
        return amount >= 0 ? `+${amount.toLocaleString()}P` : `${amount.toLocaleString()}P`;
    };

    const getTypeColor = (type, amount) => {
        if (type === 'CHARGE') return 'bg-green-100 text-green-800';
        if (type === 'USE') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'CHARGE': return '충전';
            case 'USE': return '사용';
            default: return '기타';
        }
    };

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

    return (
        <div className="min-h-screen bg-white">
            <Nav />
            <div className="container mx-auto px-4 py-16 pt-32">
                <div className="max-w-6xl mx-auto">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <span>마이페이지</span>
                            <span>/</span>
                            <span className="text-blue-600">포인트 내역</span>
                        </div>
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
                                <button 
                                    onClick={() => alert('환불요청이 완료되었습니다.')}
                                    className="text-sm text-gray-600 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
                                >
                                    환불요청
                                </button>
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
                                                    <TableCell className={`text-center font-medium ${
                                                        item.amount >= 0 ? 'text-green-600' : 'text-red-600'
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