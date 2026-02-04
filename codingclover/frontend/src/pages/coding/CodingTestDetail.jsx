import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';

const CodingTestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [userRole, setUserRole] = useState("ADMIN"); 
  const [isEditing, setIsEditing] = useState(false);
  
  const [problem, setProblem] = useState({
    title: "자바 정수 더하기",
    description: "두 정수 a와 b가 주어질 때, a + b의 값을 리턴하는 함수를 완성하세요.",
    passRate: 75,
  });
  
  const [code, setCode] = useState("// 여기에 코드를 작성하세요\npublic class Solution {\n    public int solution(int a, int b) {\n        return a + b;\n    }\n}");
  const [submissions, setSubmissions] = useState([
    { studentId: "student01", submittedAt: "2026-02-04 14:20", passed: true },
    { studentId: "student02", submittedAt: "2026-02-04 15:10", passed: false },
  ]);

  useEffect(() => {
    if (userRole === "INSTRUCTOR") {
      alert("접근 권한이 없습니다.");
      navigate("/");
      return;
    }
  }, [userRole, navigate]);

  const handleUpdate = () => {
    setIsEditing(false);
    alert("수정되었습니다.");
  };

  const handleDelete = () => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      alert("삭제되었습니다.");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Nav />
      
      <main className="flex-grow container mx-auto px-6 pt-20 pb-12 max-w-[1400px]">
        
        {/* 상단 타이틀 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex justify-between items-center">
          <div className="space-y-3">
            {isEditing ? (
              <input 
                className="text-2xl font-bold border-b-2 border-indigo-500 outline-none w-[450px] pb-1"
                value={problem.title} 
                onChange={(e) => setProblem({...problem, title: e.target.value})}
              />
            ) : (
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{problem.title}</h1>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600">통과율</span>
                <span className="text-xs font-black text-gray-900">{problem.passRate}%</span>
              </div>
              <div className="w-48 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${problem.passRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {userRole === "ADMIN" && (
            <div className="flex gap-3">
              <button 
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-bold shadow-sm"
              >
                {isEditing ? "저장" : "수정"}
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition text-sm font-bold"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 중앙: 문제(4) vs 에디터(6) */}
        <div className="flex flex-col lg:flex-row gap-6 h-[500px] mb-12">
          <div className="w-full lg:w-[40%] bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md">
            <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-sm italic">Description</span>
            </div>
            <div className="p-8 flex-grow overflow-y-auto bg-white">
              {isEditing ? (
                <textarea 
                  className="w-full h-full border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none resize-none text-sm leading-relaxed"
                  value={problem.description} 
                  onChange={(e) => setProblem({...problem, description: e.target.value})}
                />
              ) : (
                <div className="text-gray-700 text-[15px] font-medium leading-8 whitespace-pre-wrap">
                  {problem.description}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex flex-col border border-gray-800 rounded-2xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
            <div className="bg-[#2d2d2d] px-5 py-3 flex justify-between items-center text-white border-b border-white/5">
              <div className="flex items-center gap-3 font-mono text-[11px] opacity-70 tracking-widest uppercase">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <span>Solution.java</span>
              </div>
              <button 
                onClick={() => alert("제출되었습니다.")}
                className="bg-indigo-600 px-5 py-1.5 rounded-lg hover:bg-indigo-500 transition font-black text-xs shadow-lg active:scale-95"
              >
                제출하기
              </button>
            </div>
            <div className="flex-grow">
              <Editor
                height="100%"
                defaultLanguage="java"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 15,
                  lineHeight: 24,
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        </div>

        {/* 하단: 제출 기록 (너비 및 정렬 최적화) */}
        {userRole === "ADMIN" && (
          <div className="max-w-[1400px] mx-auto w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-extrabold text-gray-900 text-sm tracking-tight uppercase">Student Submissions</h2>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Admin Access Only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-gray-400 border-b bg-gray-50/20 text-[10px] font-black uppercase tracking-tighter">
                    <th className="px-20 py-4 w-[20%] text-center">아이디</th>
                    <th className="px-6 py-4 w-[40%] text-center">제출 시간</th>
                    <th className="px-6 py-4 w-[20%] text-center">상태</th>
                    <th className="px-20 py-4 w-[20%] text-center">상세보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-5 text-center font-bold text-gray-800 text-sm">{sub.studentId}</td>
                      <td className="px-6 py-5 text-center text-gray-400 text-xs font-mono tracking-tighter">{sub.submittedAt}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-block w-20 py-1 rounded-full text-[9px] font-black tracking-wide ${sub.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {sub.passed ? "SUCCESS" : "FAILED"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-indigo-600 font-bold text-xs">
                        <button className="hover:underline opacity-70 group-hover:opacity-100 transition-opacity">코드 리뷰</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Tail />
    </div>
  );
};

export default CodingTestDetail;