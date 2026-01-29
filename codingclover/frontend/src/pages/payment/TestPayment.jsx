import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

const clientKey = "test_ck_EP59LybZ8B6bWgaqMRRY86GYo7pR";

export default function TestPayment() {
  const [tossPayments, setTossPayments] = useState(null);
  const [price, setPrice] = useState(1);

  useEffect(() => {
    // CDN 스크립트가 로드된 후 window.TossPayments 사용
    const initToss = () => {
      if (window.TossPayments) {
        const tossPaymentsInstance = window.TossPayments(clientKey);
        setTossPayments(tossPaymentsInstance);
      } else {
        console.error("TossPayments SDK not loaded yet.");
      }
    };

    // 스크립트가 이미 로드되었는지 확인
    if (window.TossPayments) {
      initToss();
    } else {
      // 로드될 때까지 약간 대기하거나 이벤트를 리스닝할 수 있음 (여기서는 간단히 setTimeout)
      const timer = setTimeout(initToss, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const productName = "테스트 수강권";

  const handlePayment = async () => {
    if (!tossPayments) {
      alert("토스페이먼츠 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      tossPayments.requestPayment('카드', {
        amount: price,
        orderId: nanoid(),
        orderName: productName,
        customerName: "김토스",
        customerEmail: "customer@test.com",
        successUrl: `${window.location.origin}/test/payment/success?productId=100`, // productId 파라미터 전달
        failUrl: `${window.location.origin}/test/payment/fail`,
      })
        .catch(error => {
          if (error.code === 'USER_CANCEL') {
            // 사용자 취소
          } else {
            alert("결제 실패: " + error.message);
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">일반 결제 테스트 (API Key 방식)</h1>

      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-xl">상품명: <span className="font-bold text-blue-600">{productName}</span></p>
        <p className="text-xl">결제 금액: <span className="font-bold">{price.toLocaleString()}원</span></p>

        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600 mb-4 max-w-md text-center">
          이 테스트는 'API 개별 연동 키'를 사용하여<br />
          일반 결제창(카드 등)을 호출합니다.
        </div>

        <button
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={handlePayment}
        >
          카드 결제하기
        </button>
      </div>
    </div>
  );
}
