import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 전역 fetch 오버라이드 (401 에러 시 로그인 페이지로 이동)
// const originalFetch = window.fetch;
// let isRedirecting = false;
// window.fetch = async (...args) => {
//   const response = await originalFetch(...args);
//   if (response.status === 401 && !isRedirecting) {
//     // isRedirecting = true; -> 알림창 두번뜨면 활성화
//     alert("세션이 만료되었습니다. 다시 로그인해주세요.");
//     window.location.href = "/auth/login";
//   }
//   return response;
// };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
