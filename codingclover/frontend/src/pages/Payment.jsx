import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Label } from '../components/ui/Label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react';
import Nav from '../components/Nav';
import Tail from '../components/Tail';
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
    <div className="flex min-h-screen flex-col bg-white">
      <Nav />
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
              포인트 충전
            </h1>
            <p className="text-lg text-gray-500">
              원하는 금액을 충전하고 강좌를 수강해보세요.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* 포인트 충전 금액 선택 */}
            <Card className="bg-white border border-gray-200 shadow-none rounded-none">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  충전 금액 선택
                </CardTitle>
                <CardDescription className="text-gray-500">
                  1원 = 1포인트로 즉시 충전됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <RadioGroup
                  value={selectedAmount}
                  onValueChange={setSelectedAmount}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {amountOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`group relative flex flex-col p-6 border transition-all cursor-pointer rounded-none hover:bg-gray-50
                                ${selectedAmount === option.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-gray-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-lg font-bold ${selectedAmount === option.value ? 'text-primary' : 'text-gray-900'}`}>
                          {option.label}
                        </span>
                        <RadioGroupItem value={option.value} id={option.value} className="text-primary border-gray-300" />
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-200 w-full flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-mono">POINTS</span>
                        <span className={`font-bold font-mono ${selectedAmount === option.value ? 'text-primary' : 'text-gray-600'}`}>{option.points}</span>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 안내사항 */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-none">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                안내사항
              </h3>
              <ul className="text-sm text-blue-700 space-y-2 pl-1 list-disc list-inside">
                <li>충전된 포인트는 모든 유료 강좌 수강신청 시 현금처럼 사용할 수 있습니다.</li>
                <li>환불은 미사용 포인트에 한해 관리자를 통해 가능합니다.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-none">
                <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
                  <CardTitle className="text-lg font-bold text-gray-900">결제 요약</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>충전 금액</span>
                      <span>{parseInt(selectedAmount).toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                      <span>적립 예정 포인트</span>
                      <span className="font-bold text-primary flex items-center gap-1 font-mono">
                        +{parseInt(selectedAmount).toLocaleString()} P
                      </span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg text-gray-900">최종 결제 금액</span>
                      <span className="font-extrabold text-2xl text-primary font-mono">
                        {parseInt(selectedAmount).toLocaleString()}
                        <span className="text-base font-bold text-gray-500 ml-1 font-sans">원</span>
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isLoading || !tossPayments}
                    className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-none shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        결제 처리 중...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        결제하기
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-400">
                    위 내용을 확인하였으며 결제에 동의합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 결과 모달 */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 rounded-none shadow-2xl p-0 overflow-hidden max-w-md w-full">
          <div className={`h-2 w-full ${modalData.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <AlertDialogHeader className="flex flex-col items-center text-center p-8 pb-4">
            <div className={`mb-4 p-3 rounded-full ${modalData.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              {modalData.type === 'success' ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              {modalData.type === 'success' ? '결제 성공' : '결제 실패'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base whitespace-pre-line text-gray-500 leading-relaxed">
              {modalData.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6 pt-2 w-full flex justify-center">
            <AlertDialogAction
              onClick={closeModal}
              className={`w-full h-11 text-base font-bold text-white rounded-none ${modalData.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {modalData.type === 'success' ? '확인 (홈으로)' : '다시 시도'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tail />
    </div>
  );
}
