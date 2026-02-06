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
import Nav from '../components/Nav';
import StudentNav from '../components/StudentNav';
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
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <Nav />

      {/* Background Decoration */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pt-28 py-12 relative z-10 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-3">포인트 충전</h1>
            <p className="text-muted-foreground text-lg">원하는 금액을 충전하고 강좌를 수강해보세요.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* 포인트 충전 금액 선택 */}
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <img src={coinImg} alt="코인" className="w-6 h-6 drop-shadow-md" />
                    충전 금액 선택
                  </CardTitle>
                  <CardDescription>
                    1원 = 1포인트로 즉시 충전됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAmount}
                    onValueChange={setSelectedAmount}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {amountOptions.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 
                                ${selectedAmount === option.value
                            ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20'
                            : 'border-border bg-background/50 hover:bg-muted/50 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={option.value} id={option.value} className="text-primary" />
                          <span className="font-bold text-lg">{option.label}</span>
                        </div>
                        <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded text-sm">{option.points}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* 안내사항 */}
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <h3 className="font-bold text-blue-500 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  안내사항
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 pl-1">
                  <li className="flex items-start gap-2 before:content-['•'] before:text-blue-500">충전된 포인트는 모든 유료 강좌 수강신청 시 현금처럼 사용할 수 있습니다.</li>
                  <li className="flex items-start gap-2 before:content-['•'] before:text-blue-500">포인트 유효기간은 충전일로부터 5년입니다.</li>
                  <li className="flex items-start gap-2 before:content-['•'] before:text-blue-500">환불은 미사용 포인트에 한해 고객센터를 통해 가능합니다.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Summary & Payment */}
            <div className="lg:col-span-1">
              <Card className="bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl sticky top-28">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg">결제 상세</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>선택 금액</span>
                      <span>{parseInt(selectedAmount).toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">충전 포인트</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        +{parseInt(selectedAmount).toLocaleString()} P
                      </span>
                    </div>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg">최종 결제 금액</span>
                      <span className="font-extrabold text-2xl text-foreground">
                        {parseInt(selectedAmount).toLocaleString()}
                        <span className="text-base font-medium text-muted-foreground ml-1">원</span>
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isLoading || !tossPayments}
                    className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all mb-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        결제 준비 중...
                      </>
                    ) : '충전하기'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
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
        <AlertDialogContent className="bg-background/90 backdrop-blur-xl border-border/50">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-muted/50">
              {modalData.type === 'success' ? (
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            <AlertDialogTitle className={`text-2xl font-bold ${modalData.type === 'success' ? 'text-emerald-500' : 'text-destructive'}`}>
              {modalData.type === 'success' ? '충전 성공!' : '충전 실패'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base mt-2 whitespace-pre-line text-muted-foreground">
              {modalData.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction onClick={closeModal} className="w-full h-11 font-bold">
              {modalData.type === 'success' ? '확인' : '다시 시도'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tail />
    </div>
  );
}
