import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('basic');

  const courses = {
    basic: [
      { title: 'HTML/CSS 올인원', variant: 'success' },
      { title: '프로그래밍 첫걸음', variant: 'success' },
      { title: 'JavaScript 기초', variant: 'info' },
      { title: 'Git 기초', variant: 'success' },
      { title: '웹 개발 기초', variant: 'success' },
      
    ],
    intermediate: [
      { title: 'Python 시작하기', variant: 'info' },
      { title: 'Java 입문', variant: 'info' },
      { title: 'SQL 데이터베이스', variant: 'info' },
      { title: 'React 사용하기', variant: 'warning' },
      { title: 'Node.js 백엔드', variant: 'warning' },
      { title: 'Spring Boot 실무', variant: 'warning' },
      { title: 'REST API 설계', variant: 'warning' },
    ],
    advanced: [
      { title: 'Python으로 AI 만들기', variant: 'danger' },
      { title: '마이크로서비스 아키텍처', variant: 'danger' },
      { title: '클라우드 & DevOps', variant: 'danger' },
      { title: '시스템 설계', variant: 'danger' },
    ],
  };

  const tabs = [
    { id: 'basic', label: '초급', icon: '1-circle' },
    { id: 'intermediate', label: '중급', icon: '2-circle' },
    { id: 'advanced', label: '고급', icon: '3-circle' },
  ];

  const enrollmentCourses = [
    { title: '실무에서 깃허브 사용하는 방법', variant: 'success' },
    { title: 'JAVA 기초부터 실무까지', variant: 'info' },
    { title: '부트스트랩이란?', variant: 'warning' },
  ];

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '100px 0',
    textAlign: 'center',
  };

  const footerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '40px 0',
    marginTop: '50px',
    borderTop: '1px solid #dee2e6',
  };

  return (
    <>
      {/* 헤더 - Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="#">
            <i className="bi bi-code-square"></i> Coding-Clover
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  레벨별 강좌
                </a>
                <ul className="dropdown-menu">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <a className="dropdown-item" href="#">
                        <i className={`bi bi-${tab.icon}`}></i> {tab.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <i className="bi bi-chat-dots"></i> Q&A
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <i className="bi bi-people"></i> 커뮤니티
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <i className="bi bi-megaphone"></i> 공지사항
                </a>
              </li>
            </ul>

            <div className="d-flex">
              <input type="search" style={{ width: '300px' }} />
              <button className="btn btn-outline-secondary me-2" type="button">
                <i className="bi bi-search"></i>
              </button>
              <a href="#" className="btn btn-primary">
                <i className="bi bi-box-arrow-in-right"></i> 로그인
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <div style={heroStyle}>
        <div className="container">
          <h1 className="display-4">코딩의 세계에 오신 것을 환영합니다</h1>
          <p className="lead">신규 가입 시 첫 강좌 무료!</p>
          <div className="mt-4">
            <a href="#" className="btn btn-light btn-lg me-3">
              <i className="bi bi-book"></i> 수강신청하러 가기
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
          {courses[activeTab].map((course, index) => (
            <div className="col-md-3" key={index}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <p className="fw-bold text-dark mb-3">{course.title}</p>
                  <a href="#" className={`btn btn-sm btn-outline-${course.variant}`}>
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
          {enrollmentCourses.map((course, index) => (
            <div className="col-md-4" key={index}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <p className="fw-bold text-dark mb-3">{course.title}</p>
                  <a href="#" className={`btn btn-sm btn-outline-${course.variant}`}>
                    자세히 보기
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

      {/* 풋터 */}
      <footer className="text-center text-muted" style={footerStyle}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h5 className="fw-bold text-dark mb-3">사단법인 네잎 클로버</h5>
              <p className="mb-1">대표자 김준서 | 사업자 등록번호 000-00-00000</p>
              <p className="mb-3">주소 대구광역시 동구 동대구로 566</p>
              <hr />
              <p className="small">
                &copy;2026 Coding-Clover All rights reserved. |{' '}
                <a href="#" className="text-decoration-none">
                  이용약관
                </a>{' '}
                |{' '}
                <a href="#" className="text-decoration-none">
                  개인정보처리방침
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
