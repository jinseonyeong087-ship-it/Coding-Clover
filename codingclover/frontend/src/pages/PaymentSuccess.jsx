import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 모든 파라미터를 가져와서 Payment 페이지로 전달
    const params = new URLSearchParams();
    
    // 토스페이먼츠에서 전달하는 표준 파라미터들
    for (const [key, value] of searchParams.entries()) {
      params.append(key, value);
    }

    // Payment 페이지로 리다이렉트
    navigate(`/payment?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return <div>결제 처리 중...</div>;
}
