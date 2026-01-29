import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TestPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  const isCalled = React.useRef(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    const productId = searchParams.get('productId');

    if (!orderId || !paymentKey || !amount) {
      alert("잘못된 접근입니다.");
      navigate('/');
      return;
    }

    if (isCalled.current) {
      return;
    }
    isCalled.current = true;

    // 서버로 결제 승인 요청
    axios.post('/api/payment/success', {
      orderId,
      paymentKey,
      amount,
      productId,
      paymentMethod: "간편결제"
    })
      .then(response => {
        alert("결제 성공! DB 저장이 완료되었습니다.");
        setIsProcessing(false);
        navigate('/');
      })
      .catch(error => {
        console.error(error);
        if (error.response?.status === 500 && error.response?.data?.message?.includes("S008")) {
          // 이미 처리 중인 요청은 성공으로 간주하거나 무시할 수 있음.
          alert("결제 성공! (중복 처리 방지됨)");
          setIsProcessing(false);
          navigate('/');
          return;
        }
        alert("결제 승인 실패: " + (error.response?.data || error.message));
        navigate('/test/payment/fail');
      });

  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2 className="text-2xl font-bold">
        {isProcessing ? "결제 승인 처리 중..." : "결제 완료!"}
      </h2>
    </div>
  );
}
