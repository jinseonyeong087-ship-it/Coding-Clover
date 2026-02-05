import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Search, Plus, Users, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axios from 'axios';

// 코딩테스트 목록 페이지
const CodingTestList = () => {
  const navigate = useNavigate();

  // [수정 1] 실제 로그인된 사용자의 권한을 가져오도록 변경
  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT"; // 정보가 없으면 기본 '학생'으로 설정
  });

  const [searchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("전체");
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        // 백엔드 컨트롤러 엔드포인트에 맞춰 수정 (예: /api/coding-test)
        const response = await axios.get('/api/problems'); 
        setProblems(response.data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        // 에러 시 사용자에게 알림 (필요 시)
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);  

  // [추가] 필터링 로직: 탭 선택 및 검색어에 따른 결과 반환
  const filteredProblems = problems.filter(p => {
    const matchesTab = currentTab === "전체" || p.level === currentTab;
    const matchesSearch = p.title.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const tabs = ["전체", "초급", "중급", "고급"];

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Nav />
      
      <main className="flex-grow container mx-auto px-6 pt-20 pb-16 max-w-[1200px]">
        
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="space-y-3">
           {/* [수정 2] 어드민일 때와 학생일 때의 제목을 다르게 표시 */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {userRole === "ADMIN" ? "코딩테스트 문항 관리" : "코딩테스트 연습"}
            </h1>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* 문제 검색 기능 */}
            {/* <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="문제 검색..." 
                className="pl-11 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
            {/* [수정 3] '새 문제 등록' 버튼은 어드민일 때만 보이게 처리 */}
            {userRole === "ADMIN" && (
              <Button 
                onClick={() => navigate("/coding-test/new")} 
                className="h-12 px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
              <Plus className="mr-2 h-5 w-5" /> 새 문제 등록
            </Button>
            )}
          </div>
        </div>

        {/* [추가] 탭 메뉴 섹션 */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                currentTab === tab 
                ? "text-indigo-600" 
                : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {currentTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 목록 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-24 text-center text-gray-400">데이터를 불러오는 중입니다...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-24 text-center text-gray-400 font-bold">
              해당 난이도에 등록된 문제가 없습니다.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                  <th className="px-8 py-5 w-[100px] text-center">ID</th>
                  <th className="px-8 py-5">문제명</th>
                  <th className="px-8 py-5 w-[200px] text-center">통과율</th>

                  {/* [권한 로직] 관리자에게만 제출 인원 표시 */}
                  {userRole === "ADMIN" && <th className="px-8 py-5 w-[150px] text-center">제출 인원</th>}
                  <th className="px-8 py-5 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredProblems.map((problem, index) => (
                <tr 
                  key={`problem-${problem.id || index}`}
                  onClick={() => navigate(`/coding-test/${problem.id}`)}
                  className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                >
                  <td className="px-8 py-6 text-center font-mono text-xs text-gray-400">
                    {String(problem.id).padStart(3, '0')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {problem.title}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          problem.level === "초급" ? "bg-green-100 text-green-700" : 
                          problem.level === "중급" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                        }`}>
                          {problem.level}
                        </span>
                        <span className="text-[10px] text-gray-300">등록: {problem.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="space-y-2 max-w-[140px] mx-auto">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-300 tracking-tighter">Pass Rate</span>
                        <span className="text-indigo-600">{problem.passRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className="bg-indigo-500 h-1 rounded-full" 
                          style={{ width: `${problem.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  
                  {/* 어드민일 때만 보이게 처리 */}
                  {userRole === "ADMIN" && (
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{problem.totalSubmissions || 0}명</span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6 text-right">
                    <ChevronRight className="h-5 w-5 text-gray-200 group-hover:text-indigo-300 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </main>

      <Tail />
    </div>
  );
}

export default CodingTestList;