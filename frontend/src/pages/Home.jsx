import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import StudentNav from '../components/StudentNav';
import Tail from '../components/Tail';
import { BrowserRouter, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

function Home() {
  let [activeTab, setActiveTab] = useState('1');

  let level = { 
    1: '초급',
    2: '중급',
    3: '고급'
  };

  let tabs = [
    { id: '1', label: '초급' },
    { id: '2', label: '중급' },
    { id: '3', label: '고급' },
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
        <StudentNav/>
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
          </div>

            {/* 코딩애플 보면서 만든 거 */}
            <Tabs defaultValue="1" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="1">초급</TabsTrigger>
                <TabsTrigger value="2">중급</TabsTrigger>
                <TabsTrigger value="3">고급</TabsTrigger>
              </TabsList>
              <TabsContent value="1">"{title}"</TabsContent>
              <TabsContent value="2">"{title}"</TabsContent>
              <TabsContent value="3">"{title}"</TabsContent>
            </Tabs>

            
            {/* 코딩애플 보면서 만든 거 */}

            {/* <div className="row g-4">
              {course[activeTab].map((item, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <p className="fw-bold text-dark mb-3">"{item.title}"</p>
                      <a href="#">
                        자세히 보기
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}
          {/* </div> */}

          {/* 
            수강 신청 섹션 
          <div className="container mx-auto my-12 px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">수강 신청</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enrollment.map((course, index) => (
                <Card key={index} className="h-full shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <p className="font-bold text-foreground mb-4">{course.title}</p>
                    <Button variant="outline" size="sm">
                      수강신청
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end items-center mt-6">
              <Button variant="outline" size="sm">
                전체 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          */}
      <Tail></Tail>
    </>
  );
};

export default Home;
