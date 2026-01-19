import React, { useState } from 'react';
import StudentNav from '../components/StudentNav';
import Tail from '../components/Tail';
import { BrowserRouter } from 'react-router-dom';

function Home() {
  let [activeTab, setActiveTab] = useState('basic');
  // 레벨  1 2 3이었으
  let course = {
    basic: [
      { title: 'HTML/CSS 올인원', variant: 'warning' },
      { title: '프로그래밍 첫걸음', variant: 'warning' },
      { title: 'Git 기초', variant: 'warning' },
      { title: '웹 개발 기초', variant: 'warning' },
      { title: 'JavaScript 기초', variant: 'warning' },
      { title: 'Python 시작하기', variant: 'warning' },
      { title: 'Java 입문', variant: 'warning' },
      { title: 'SQL 데이터베이스', variant: 'warning' },
    ],
    intermediate: [
      { title: 'React 사용하기', variant: 'info' },
      { title: 'Node.js 백엔드', variant: 'info' },
      { title: 'Spring Boot 실무', variant: 'info' },
      { title: 'REST API 설계', variant: 'info' },
    ],
    advanced: [
      { title: 'Python으로 AI 만들기', variant: 'success' },
      { title: '마이크로서비스 아키텍처', variant: 'success' },
      { title: '클라우드 & DevOps', variant: 'success' },
      { title: '시스템 설계', variant: 'success' },
    ],
  };

  let tabs = [
    { id: 'basic', label: '초급' },
    { id: 'intermediate', label: '중급' },
    { id: 'advanced', label: '고급' },
  ];

  let enrollment = [
    { title: '실무에서 깃허브 사용하는 방법', variant: 'primary' },
    { title: 'JAVA 기초부터 실무까지', variant: 'primary' },
    { title: '부트스트랩이란?', variant: 'primary' },
  ];

  let heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '100px 0',
    textAlign: 'center',
  };

  let footerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '40px 0',
    marginTop: '50px',
    borderTop: '1px solid #dee2e6',
  };

  return (
    <>
        <StudentNav></StudentNav>
          {/* 히어로 섹션 */}
          <div style={heroStyle}>
            <div className="container">
              <h1 className="display-4">코딩의 세계에 오신 것을 환영합니다</h1>
              <p className="lead">신규 가입 시 첫 강좌 무료!</p>
              <div className="mt-4">
                <a href="#" className="btn btn-light btn-lg me-3">
                  <i className="bi bi-book"></i> 수강신청하기
                </a>
                <a href="#" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-play-circle"></i> 강좌 둘러보기
                </a>
              </div>
            </div>
          </div>

          {/* 인기 강좌 섹션 */}
          <div className="container my-5">
            <h2 className="mb-4">인기 강좌</h2>

            <ul className="nav nav-tabs mb-4">
              {tabs.map((tab) => (
                <li className="nav-item" key={tab.id}>
                  <button
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi bi-${tab.icon}`}></i> {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="row g-4">
              {course[activeTab].map((item, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <p className="fw-bold text-dark mb-3">{item.title}</p>
                      <a href="#" className={`btn btn-sm btn-outline-${item.variant}`}>
                        자세히 보기
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 수강 신청 섹션 */}
          <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">수강 신청</h2>
            </div>
            <div className="row g-4">
              {enrollment.map((course, index) => (
                <div className="col-md-4" key={index}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <p className="fw-bold text-dark mb-3">{course.title}</p>
                      <a href="#" className={`btn btn-sm btn-outline-${course.variant}`}>
                        수강신청
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end align-items-center mt-4">
              <a href="#" className="btn btn-outline-primary btn-sm">
                전체 보기 <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
      <Tail></Tail>
    </>
  );
};

export default Home;
