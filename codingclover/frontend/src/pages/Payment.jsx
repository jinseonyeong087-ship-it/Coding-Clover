import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Label } from '../components/ui/Label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import StudentNav from '../components/StudentNav';
import coinImg from '../img/coin.png';

const clientKey = "test_ck_EP59LybZ8B6bWgaqMRRY86GYo7pR";

export default function Payment() {
  const [tossPayments, setTossPayments] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState('10000');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: '', message: '', points: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const initToss = () => {
      if (window.TossPayments) {
        const tossPaymentsInstance = window.TossPayments(clientKey);
        setTossPayments(tossPaymentsInstance);
      } else {
        console.error("TossPayments SDK not loaded yet.");
      }
    };

    if (window.TossPayments) {
      initToss();
    } else {
      const timer = setTimeout(initToss, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // URL 파라미터로 결제 결과 처리 (토스페이먼츠에서 돌아올 때)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');
    
    // 결제 실패 파라미터
    const errorCode = urlParams.get('code');
    const errorMessage = urlParams.get('message');

    if (paymentKey && orderId && amount) {
      // 결제 성공 시 처리
      const points = parseInt(amount);
      handlePaymentSuccess(orderId, paymentKey, parseInt(amount), points);
      // URL 파라미터 정리
      window.history.replaceState({}, document.title, '/payment');
    } else if (errorCode || errorMessage) {
      // 결제 실패 시 처리
      const failMessage = errorMessage || '결제에 실패하였습니다.';
      handlePaymentError(failMessage);
      // URL 파라미터 정리
      window.history.replaceState({}, document.title, '/payment');
    }
  }, []);

  // 결제 성공 처리
  const handlePaymentSuccess = async (orderId, paymentKey, amount, points) => {
    try {
      setIsLoading(true);
      
      // 1. 토스페이먼츠 결제 승인 API 호출
      const confirmResponse = await axios.post('/api/payment/confirm', {
        orderId,
        paymentKey,
        amount: amount
      }, {
        withCredentials: true
      });

      // 2. 포인트 충전 API 호출
      const chargeResponse = await axios.post('/api/wallet/charge', {
        amount: amount,
        paymentId: confirmResponse.data.paymentId
      }, {
        withCredentials: true
      });

      // 3. 성공 모달 표시
      setModalData({
        type: 'success',
        message: `${points.toLocaleString()}P 충전 완료!\n결제가 완료되었습니다.`,
        points: points
      });
      setIsModalOpen(true);

      // 4. 네비게이션에 포인트 업데이트 알림
      window.dispatchEvent(new Event('pointsUpdated'));

    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      setModalData({
        type: 'error',
        message: '결제에 실패하였습니다.\n잠시 후 다시 시도해주세요.',
        points: 0
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 결제 실패 처리
  const handlePaymentError = (message) => {
    setModalData({
      type: 'error',
      message: message || '결제에 실패하였습니다.',
      points: 0
    });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    if (modalData.type === 'success') {
      navigate('/'); // 성공 시 홈으로 이동
    }
  };

  const amountOptions = [
    { value: '10000', label: '10,000원', points: '10,000P' },
    { value: '30000', label: '30,000원', points: '30,000P' },
    { value: '50000', label: '50,000원', points: '50,000P' },
    { value: '100000', label: '100,000원', points: '100,000P' }
  ];

  const handlePayment = async () => {
    if (!tossPayments) {
      handlePaymentError("토스페이먼츠 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    const amount = parseInt(selectedAmount);
    const points = amount; // 1원 = 1포인트
    const orderId = nanoid();

    try {
      await tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: orderId,
        orderName: `포인트 충전 ${points.toLocaleString()}P`,
        customerName: "수강생",
        customerEmail: "student@test.com",
        successUrl: `${window.location.origin}/payment`,
        failUrl: `${window.location.origin}/payment`,
      });
    } catch (error) {
      setIsLoading(false);
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.');
      } else {
        handlePaymentError("결제 중 오류가 발생했습니다: " + error.message);
        console.error('결제 오류:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StudentNav />
      
      <div className="container mx-auto px-4 pt-28 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">포인트 충전</h1>
            <p className="text-gray-600">충전할 포인트 금액을 선택해주세요</p>
          </div>

          {/* 포인트 충전 카드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={coinImg} alt="코인" className="w-6 h-6" />
                포인트 충전 금액 선택
              </CardTitle>
              <CardDescription>
                1원 = 1포인트로 충전됩니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedAmount} 
                onValueChange={setSelectedAmount}
                className="grid grid-cols-2 gap-4"
              >
                {amountOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">{option.label}</span>
                      <span className="text-sm text-blue-600">{option.points}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 결제 정보 카드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>결제 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">충전 금액</span>
                  <span className="font-semibold">{parseInt(selectedAmount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">획득 포인트</span>
                  <span className="font-semibold text-blue-600">{parseInt(selectedAmount).toLocaleString()}P</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-red-600">{parseInt(selectedAmount).toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 버튼 */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading || !tossPayments}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? '결제 진행 중...' : `${parseInt(selectedAmount).toLocaleString()}원 카드결제`}
          </Button>

          {/* 안내사항 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">안내사항</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 충전된 포인트는 수강신청 시 사용할 수 있습니다</li>
              <li>• 환불은 미사용 포인트에 한해 가능합니다</li>
              <li>• 환불 관련 문의사항은 관리자에게 요청해주세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 결제 결과 모달 */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="mb-4">
              {modalData.type === 'success' ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <AlertDialogTitle className={`text-xl ${modalData.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {modalData.type === 'success' ? '결제 완료!' : '결제 실패'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center whitespace-pre-line">
              {modalData.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeModal} className="w-full">
              {modalData.type === 'success' ? '확인' : '다시 시도'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
