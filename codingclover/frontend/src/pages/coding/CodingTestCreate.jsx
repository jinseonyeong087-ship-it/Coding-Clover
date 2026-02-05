import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Save, ArrowLeft, FileCode, LayoutList } from "lucide-react";
import Editor from "@monaco-editor/react";
import axios from 'axios';

// 코딩테스트 생성 페이지
const CodingTestCreate = () => {
  const navigate = useNavigate();

  // [권한 확인] 어드민만 접근 가능하도록 설정
  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT";
  });

  useEffect(() => {
    if (userRole !== "ADMIN") {
      alert("관리자 권한이 필요합니다.");
      navigate("/coding-test");
    }
  }, [userRole, navigate]);

  const [problem, setProblem] = useState({
    title: "",
    level: "초급",
    description: "",
    // 기본 자바 템플릿 제공
    baseCode: "public class Solution {\n    public int solution(int a, int b) {\n        return 0;\n    }\n}"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value) => {
    setProblem(prev => ({ ...prev, baseCode: value }));
  };

  // [연동] 서버로 새 문제 데이터 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problem.title || !problem.description) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      // 백엔드 @RequestMapping("/api/problems")와 매핑되는 POST 요청
      await axios.post('/api/problems', {
        title: problem.title,
        level: problem.level,
        description: problem.description,
        baseCode: problem.baseCode
      });

      alert("새로운 문제가 등록되었습니다.");
      navigate("/coding-test"); // 등록 후 목록으로 이동
    } catch (error) {
      console.error("문제 등록 실패:", error);
      alert("서버 오류로 문제 등록에 실패했습니다.");
    }
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Nav />
      
      <main className="flex-grow container mx-auto px-6 pt-20 pb-16 max-w-[1200px]">
        {/* 상단 헤더 섹션 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">새 문제 등록</h1>
          </div>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Save className="h-5 w-5" />
            문제 저장하기
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 왼쪽 입력 폼 (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              {/* 제목 입력 */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <LayoutList className="h-3 w-3" /> Problem Title
                </label>
                <input 
                  type="text"
                  name="title"
                  placeholder="문제 제목을 입력하세요"
                  className="w-full text-lg font-bold border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-2 transition-colors"
                  value={problem.title}
                  onChange={handleChange}
                />
              </div>

              {/* 난이도 선택 */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Difficulty</label>
                <div className="flex gap-2">
                  {["초급", "중급", "고급"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProblem(prev => ({ ...prev, level: lvl }))}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        problem.level === lvl 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 설명 입력 */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Description</label>
                <textarea 
                  name="description"
                  placeholder="문제를 설명해주세요 (제약 사항, 입출력 예시 등)"
                  className="w-full h-80 border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500/10 outline-none resize-none text-sm leading-relaxed"
                  value={problem.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽 에디터 폼 (7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex-grow flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex justify-between items-center text-gray-400 font-black text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-2"><FileCode className="h-3 w-3" /> Base Code Template</div>
                <span className="bg-indigo-50 text-indigo-400 px-2 py-0.5 rounded">Java</span>
              </div>
              <div className="flex-grow bg-[#1e1e1e]">
                <Editor
                  height="600px"
                  defaultLanguage="java"
                  theme="vs-dark"
                  value={problem.baseCode}
                  onChange={handleEditorChange}
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 14,
                    lineHeight: 22,
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium px-2">
              * 학생들이 문제를 처음 열었을 때 보여질 기본 코드 구조를 작성해주세요.
            </p>
          </div>
        </div>
      </main>

      <Tail />
    </div>
  );
};

export default CodingTestCreate;