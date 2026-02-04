import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const isCalled = React.useRef(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    const points = searchParams.get('points');

    if (!orderId || !paymentKey || !amount) {
      setError("잘못된 접근입니다.");
      setIsProcessing(false);
      return;
    }

    if (isCalled.current) {
      return;
    }
    isCalled.current = true;

    // 서버로 결제 승인 및 포인트 충전 요청
    const processPayment = async () => {
      try {
        // 1. 토스페이먼츠 결제 승인
        const confirmResponse = await axios.post('/api/payment/confirm', {
          orderId,
          paymentKey,
          amount: parseInt(amount)
        });

        // 2. 포인트 충전 API 호출
        const chargeResponse = await axios.post('/api/wallet/charge', {
          amount: parseInt(amount),
          paymentId: confirmResponse.data.paymentId
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        // 3. 성공 데이터 설정
        setSuccessData({
          amount: parseInt(amount),
          points: parseInt(points || amount),
          orderId: orderId,
          paymentId: confirmResponse.data.paymentId,
          currentBalance: chargeResponse.data.currentBalance
        });

        // 4. 네비게이션에 포인트 업데이트 알림
        window.dispatchEvent(new Event('pointsUpdated'));

        setIsProcessing(false);

      } catch (error) {
        console.error('결제 처리 중 오류:', error);
        
        if (error.response?.status === 401) {
          setError("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(error.response?.data?.message || "결제 처리 중 오류가 발생했습니다.");
        }
        
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <h2 className="text-lg font-semibold mb-2">결제 처리 중입니다</h2>
              <p className="text-gray-600">잠시만 기다려주세요...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 text-xl">✕</span>
              </div>
              <h2 className="text-lg font-semibold text-red-600 mb-2">결제 실패</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">결제 완료!</CardTitle>
          <CardDescription>포인트 충전이 성공적으로 완료되었습니다.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 충전 정보 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">충전 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">결제 금액</span>
                <span className="font-semibold">{successData?.amount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">충전된 포인트</span>
                <span className="font-semibold text-blue-600">+{successData?.points.toLocaleString()}P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">현재 잔액</span>
                <span className="font-bold text-lg">{successData?.currentBalance.toLocaleString()}P</span>
              </div>
            </div>
          </div>

          {/* 주문 정보 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">주문 정보</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>주문번호</span>
                <span className="font-mono">{successData?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 ID</span>
                <span className="font-mono">{successData?.paymentId}</span>
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/student/wallet/history')}
            >
              충전 내역 보기
            </Button>
            <Button 
              className="flex-1"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </Button>
          </div>

          {/* 안내사항 */}
          <div className="text-xs text-gray-500 text-center">
            충전된 포인트는 수강신청 시 사용할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
