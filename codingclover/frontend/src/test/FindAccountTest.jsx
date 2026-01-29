import React, { useState } from 'react';
import axios from 'axios';

const FindAccountTest = () => {
    // 탭 상태: 'id' (아이디 찾기) | 'pw' (비밀번호 찾기)
    const [activeTab, setActiveTab] = useState('id');

    // --- 아이디 찾기 상태 ---
    const [idName, setIdName] = useState('');
    const [idEmail, setIdEmail] = useState('');
    const [foundId, setFoundId] = useState('');
    const [idMessage, setIdMessage] = useState('');

    // --- 비밀번호 찾기 상태 ---
    const [pwStep, setPwStep] = useState(1); // 1: 정보입력, 2: 인증번호, 3: 재설정
    const [pwLoginId, setPwLoginId] = useState('');
    const [pwName, setPwName] = useState('');
    const [pwEmail, setPwEmail] = useState('');
    const [authNum, setAuthNum] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwMessage, setPwMessage] = useState('');

    // --- 공통 스타일 ---
    const containerStyle = { padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' };
    const inputStyle = { display: 'block', width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' };
    const buttonStyle = { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', marginRight: '5px' };
    const tabButtonStyle = (isActive) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: isActive ? '#2196F3' : '#e0e0e0',
        color: isActive ? 'white' : 'black',
        border: 'none',
        marginRight: '5px'
    });

    // --- 아이디 찾기 핸들러 ---
    const handleFindId = async () => {
        try {
            setIdMessage('조회 중...');
            setFoundId('');
            const response = await axios.post('http://localhost:3333/auth/findRequest', {
                type: 'id',
                name: idName,
                email: idEmail
            });
            setFoundId(response.data.loginId);
            setIdMessage('조회 성공!');
        } catch (error) {
            console.error(error);
            setIdMessage(`실패: ${error.response?.data?.message || error.message}`);
        }
    };

    // --- 비밀번호 찾기 핸들러 ---

    // 1단계: 정보 확인 및 인증메일 발송
    const handleFindPwStep1 = async () => {
        try {
            setPwMessage('정보 확인 및 메일 발송 중...');
            const response = await axios.post('http://localhost:3333/auth/findRequest', {
                type: 'pw',
                loginId: pwLoginId,
                name: pwName,
                email: pwEmail
            });
            setPwMessage(response.data.message || '메일 발송 완료. 인증번호를 입력하세요.');
            setPwStep(2);
        } catch (error) {
            console.error(error);
            setPwMessage(`실패: ${error.response?.data?.message || error.message}`);
        }
    };

    // 2단계: 인증번호 확인 (MailController 사용)
    const handleVerifyAuthNum = async () => {
        try {
            setPwMessage('인증번호 확인 중...');
            // MailController의 mailCheck는 GET 요청, userNumber 파라미터 사용
            const response = await axios.get(`http://localhost:3333/member/mailCheck?userNumber=${authNum}`);

            if (response.data === true) {
                setPwMessage('인증 성공! 새로운 비밀번호를 설정하세요.');
                setPwStep(3);
            } else {
                setPwMessage('인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error(error);
            setPwMessage(`인증 오류: ${error.message}`);
        }
    };

    // 3단계: 비밀번호 재설정
    const handleResetPassword = async () => {
        try {
            setPwMessage('비밀번호 변경 중...');
            const response = await axios.post('http://localhost:3333/auth/findRequest', {
                type: 'reset',
                loginId: pwLoginId,
                newPassword: newPassword
            });
            setPwMessage(response.data.message || '비밀번호가 성공적으로 변경되었습니다.');
            setPwStep(1); // 초기화
        } catch (error) {
            console.error(error);
            setPwMessage(`변경 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div style={containerStyle}>
            <h1>아이디/비밀번호 찾기 테스트</h1>
            <div style={{ marginBottom: '20px' }}>
                <button style={tabButtonStyle(activeTab === 'id')} onClick={() => setActiveTab('id')}>아이디 찾기</button>
                <button style={tabButtonStyle(activeTab === 'pw')} onClick={() => setActiveTab('pw')}>비밀번호 찾기</button>
            </div>

            {/* 아이디 찾기 영역 */}
            {activeTab === 'id' && (
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                    <h3>아이디 찾기</h3>
                    <input
                        style={inputStyle}
                        placeholder="이름 (Name)"
                        value={idName}
                        onChange={(e) => setIdName(e.target.value)}
                    />
                    <input
                        style={inputStyle}
                        placeholder="이메일 (Email)"
                        value={idEmail}
                        onChange={(e) => setIdEmail(e.target.value)}
                    />
                    <button style={buttonStyle} onClick={handleFindId}>아이디 찾기</button>

                    {idMessage && <p style={{ marginTop: '10px' }}>{idMessage}</p>}
                    {foundId && <h2 style={{ color: 'blue' }}>ID: {foundId}</h2>}
                </div>
            )}

            {/* 비밀번호 찾기 영역 */}
            {activeTab === 'pw' && (
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                    <h3>비밀번호 찾기 (Step {pwStep}/3)</h3>

                    {/* Step 1: 정보 입력 */}
                    {pwStep === 1 && (
                        <>
                            <input
                                style={inputStyle}
                                placeholder="아이디 (Login ID)"
                                value={pwLoginId}
                                onChange={(e) => setPwLoginId(e.target.value)}
                            />
                            <input
                                style={inputStyle}
                                placeholder="이름 (Name)"
                                value={pwName}
                                onChange={(e) => setPwName(e.target.value)}
                            />
                            <input
                                style={inputStyle}
                                placeholder="이메일 (Email)"
                                value={pwEmail}
                                onChange={(e) => setPwEmail(e.target.value)}
                            />
                            <button style={buttonStyle} onClick={handleFindPwStep1}>정보 확인 및 인증메일 발송</button>
                        </>
                    )}

                    {/* Step 2: 인증번호 입력 */}
                    {pwStep === 2 && (
                        <>
                            <p>이메일로 전송된 인증번호 6자리를 입력해주세요.</p>
                            <input
                                style={inputStyle}
                                placeholder="인증번호"
                                value={authNum}
                                onChange={(e) => setAuthNum(e.target.value)}
                            />
                            <button style={buttonStyle} onClick={handleVerifyAuthNum}>인증번호 확인</button>
                            <button style={{ ...buttonStyle, backgroundColor: '#999' }} onClick={() => setPwStep(1)}>뒤로가기</button>
                        </>
                    )}

                    {/* Step 3: 비밀번호 재설정 */}
                    {pwStep === 3 && (
                        <>
                            <p>새로운 비밀번호를 입력해주세요.</p>
                            <input
                                style={inputStyle}
                                type="password"
                                placeholder="새 비밀번호"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button style={buttonStyle} onClick={handleResetPassword}>비밀번호 변경</button>
                        </>
                    )}

                    {pwMessage && <p style={{ marginTop: '10px', color: 'red' }}>{pwMessage}</p>}
                </div>
            )}
        </div>
    );
};

export default FindAccountTest;
