import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-red-600 text-3xl font-bold mb-4">결제 실패</h1>
        <p className="text-gray-700 mb-2">{message}</p>
        <p className="text-gray-500 text-sm mb-6">ERROR CODE: {code}</p>
        <Link to="/test/payment/checkout" className="text-blue-500 hover:underline">
          다시 시도하기
        </Link>
      </div>
    </div>
  );
}
