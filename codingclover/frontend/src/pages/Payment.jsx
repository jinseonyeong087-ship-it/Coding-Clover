import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Label } from '../components/ui/Label';
import StudentNav from '../components/StudentNav';
import coinImg from '../img/coin.png';

const clientKey = "test_ck_EP59LybZ8B6bWgaqMRRY86GYo7pR";

export default function Payment() {
  const [tossPayments, setTossPayments] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState('10000');
  const [isLoading, setIsLoading] = useState(false);

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

  const amountOptions = [
    { value: '10000', label: '10,000원', points: '10,000P' },
    { value: '30000', label: '30,000원', points: '30,000P' },
    { value: '50000', label: '50,000원', points: '50,000P' },
    { value: '100000', label: '100,000원', points: '100,000P' }
  ];

  const handlePayment = async () => {
    if (!tossPayments) {
      alert("토스페이먼츠 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);
    const amount = parseInt(selectedAmount);
    const points = amount; // 1원 = 1포인트

    try {
      await tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: nanoid(),
        orderName: `포인트 충전 ${points.toLocaleString()}P`,
        customerName: "수강생",
        customerEmail: "student@test.com",
        successUrl: `${window.location.origin}/payment/success?amount=${amount}&points=${points}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      if (error.code === 'USER_CANCEL') {
        console.log('사용자가 결제를 취소했습니다.');
      } else {
        alert("결제 실패: " + error.message);
        console.error('결제 오류:', error);
      }
    } finally {
      setIsLoading(false);
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
    </div>
  );
}
