import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';

const CodingTestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem('users'));
    return user?.role || "STUDENT";
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!id || id === "undefined") {
        navigate("/coding-test");
        return;
      }

      try {
        setLoading(true);
        // 1. 문제 정보 조회
        const response = await axios.get(`/api/problems/${id}`);
        if (response.data) {
          setProblem(response.data);
          setCode(response.data.baseCode || "// 코드를 작성하세요");
        }

        // 2. 제출 기록 조회 (관리자 전용)
        if (userRole === "ADMIN") {
          try {
            const subRes = await axios.get(`/api/problems/${id}/submissions`);
            setSubmissions(Array.isArray(subRes.data) ? subRes.data : []);
          } catch (subError) {
            // 백엔드 구현이 덜 되었을 때 500 에러 방어
            console.error("제출 기록 로드 실패:", subError.response?.data || subError.message);
            setSubmissions([]);
          }
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        alert("정보를 불러오지 못했습니다.");
        navigate("/coding-test");
      } finally {
        setLoading(false);
      }
    };
    fetchDetailData();
  }, [id, userRole, navigate]);

  const handleUpdate = async () => {
    try {
      const updateData = {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty, // 백엔드 필드명에 맞춤
        baseCode: code // 에더터의 내용을 baseCode로 저장
      };
      await axios.put(`/api/problems/${id}`, updateData);
      setIsEditing(false);
      alert("성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("수정 실패:", error.response?.data || error.message);
      alert("수정 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/problems/${id}`);
      navigate("/coding-test");
    } catch (error) { alert("삭제 실패"); }
  };

  const handleSubmitCode = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('users'));
      const response = await axios.post(`/api/problems/${id}/submit`, {
        userId: user.userId,
        code: code
      });
      alert(response.data.passed ? "정답입니다! 🎉" : `오답입니다: ${response.data.message || ""}`);
    } catch (error) { alert("제출 처리 중 오류 발생"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 italic uppercase">Loading Problem Data...</div>;
  if (!problem) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <Nav />
      <main className="flex-grow container mx-auto px-6 pt-32 pb-12 max-w-[1400px]">
        {/* 상단 섹션 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex justify-between items-center">
          <div className="space-y-4">
            {isEditing ? (
              <input className="text-3xl font-black border-b-4 border-indigo-500 outline-none w-[600px] pb-2" value={problem.title} onChange={(e) => setProblem({ ...problem, title: e.target.value })} />
            ) : (
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{problem.title}</h1>
            )}
            <div className="flex items-center gap-6 font-black text-[10px] uppercase tracking-widest text-indigo-500">
              <span className="bg-indigo-50 px-3 py-1 rounded-lg">Level: {problem.difficulty || "EASY"}</span>
              <span className="text-gray-400">Pass Rate: {problem.passRate || 0}%</span>
            </div>
          </div>
          {userRole === "ADMIN" && (
            <div className="flex gap-3">
              <button onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-black transition-all">{isEditing ? "수정완료" : "수정하기"}</button>
              <button onClick={handleDelete} className="px-8 py-3 border-2 border-red-50 text-red-500 rounded-2xl text-sm font-black hover:bg-red-50 transition-all">삭제하기</button>
            </div>
          )}
        </div>

        {/* 설명 및 에디터 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px] mb-12">
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-10 overflow-y-auto shadow-sm">
            <h3 className="font-black text-gray-900 mb-6 border-b pb-4 uppercase text-[10px] tracking-[0.2em] opacity-30 italic">Problem Statement</h3>
            {isEditing ? (
              <textarea className="w-full h-full outline-none resize-none text-base leading-loose font-medium" value={problem.description} onChange={(e) => setProblem({ ...problem, description: e.target.value })} />
            ) : (
              <div className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed font-semibold">{problem.description}</div>
            )}
          </div>
          <div className="lg:col-span-7 flex flex-col border border-gray-800 rounded-3xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
            <div className="bg-[#2d2d2d] px-6 py-4 flex justify-between items-center text-white border-b border-white/5">
              <span className="font-mono text-[10px] opacity-50 uppercase tracking-widest italic">Solution.java</span>
              {userRole !== "ADMIN" && <button onClick={handleSubmitCode} className="bg-indigo-600 px-6 py-2 rounded-xl font-black text-[10px] shadow-lg hover:bg-indigo-500 transition-all uppercase tracking-tighter">Submit Code</button>}
            </div>
            <Editor height="100%" defaultLanguage="java" theme="vs-dark" value={code} onChange={(v) => setCode(v)} options={{ minimap: { enabled: false }, fontSize: 16, lineHeight: 28 }} />
          </div>
        </div>

        {/* 제출 현황 (ADMIN) */}
        {userRole === "ADMIN" && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-[0.3em] text-center">Recent Submissions</div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b bg-gray-50/20 text-[9px] font-black uppercase">
                  <th className="px-8 py-5 text-center">User</th>
                  <th className="px-8 py-5 text-center">Date</th>
                  <th className="px-8 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-xs uppercase tracking-tight">
                {submissions.length > 0 ? submissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-all">
                    <td className="px-8 py-6 text-center text-gray-800 italic">#{sub.loginId || sub.userId}</td>
                    <td className="px-8 py-6 text-center text-gray-400 font-mono tracking-tighter">{sub.submittedAt}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.status === "PASS" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-20 text-center text-gray-300 font-black uppercase italic tracking-widest">No Records Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Tail />
    </div>
  );
};

export default CodingTestDetail;