import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 실패 파라미터들을 Payment 페이지로 전달
    const params = new URLSearchParams();
    
    for (const [key, value] of searchParams.entries()) {
      params.append(key, value);
    }

    // Payment 페이지로 리다이렉트
    navigate(`/payment?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return <div>결제 실패 처리 중...</div>;
}
