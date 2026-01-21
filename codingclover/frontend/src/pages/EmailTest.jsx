import React, { useState } from 'react';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [authNum, setAuthNum] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // 실제 백엔드 주소 (React Proxy 설정이 안 되어 있다면 전체 주소 필요)
  // package.json에 proxy 설정이 되어있다면 '/member/mailSend' 만 써도 됨
  const API_BASE_URL = 'http://localhost:3333';

  const handleSend = async () => {
    try {
      setMessage('전송 중...');
      const response = await fetch(`${API_BASE_URL}/member/mailSend?mail=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // 세션 유지 설정
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSent(true);
        setMessage('✅ 인증번호 발송 완료! (콘솔/로그 확인)');
      } else {
        setMessage(`❌ 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ 서버 연결 실패 (CORS 또는 서버 꺼짐 확인)');
    }
  };

  const handleCheck = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/member/mailCheck?userNumber=${authNum}`, {
        credentials: 'include', // 세션 유지 설정
      });
      const isMatch = await response.json();

      if (isMatch) {
        setIsVerified(true);
        setMessage('🎉 인증 성공!');
      } else {
        setMessage('❌ 인증번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ 서버 연결 실패');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>📧 이메일 인증 테스트 (React)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 입력"
          style={{ padding: '10px', width: '70%', marginRight: '5px' }}
        />
        <button onClick={handleSend} disabled={isSent || isVerified} style={{ padding: '10px' }}>
          전송
        </button>
      </div>

      {isSent && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={authNum}
            onChange={(e) => setAuthNum(e.target.value)}
            placeholder="인증번호 6자리"
            style={{ padding: '10px', width: '70%', marginRight: '5px' }}
          />
          <button onClick={handleCheck} disabled={isVerified} style={{ padding: '10px' }}>
            확인
          </button>
        </div>
      )}

      <p style={{ fontWeight: 'bold', color: isVerified ? 'green' : 'red' }}>
        {message}
      </p>
    </div>
  );
};

export default EmailTest;
