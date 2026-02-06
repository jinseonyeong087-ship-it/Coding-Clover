import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import Nav from "@/components/Nav";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import {
  Play, Send, Code2, Terminal,
  ChevronRight, Check, X,
  RotateCcw, BookOpen, LayoutDashboard, ListTodo, AlertCircle, Sparkles,
  Save, Trash2, Edit, History // Admin Icons
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster, toast } from 'sonner';

// --- Components ---

const StatusIcon = ({ status }) => {
  if (status === 'PASS') return <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-600" /></div>;
  if (status === 'FAIL') return <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center"><X className="w-3 h-3 text-rose-600" /></div>;
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />;
};

const getDifficultyLabel = (diff) => {
  if (diff === 'EASY') return '초급';
  if (diff === 'MEDIUM') return '중급';
  if (diff === 'HARD') return '고급';
  return diff;
};

const DEFAULT_CODE = `public class main {
    // 여기에 코드를 입력하세요.
}`;

const CodingTestDetail = () => {
  const { id } = useParams(); // URL의 id (초기 로드용)
  const navigate = useNavigate();

  // 사용자 권한 및 ID
  const [user] = useState(() => JSON.parse(localStorage.getItem('users')) || { role: "STUDENT" });
  const userRole = user.role;

  // 전체 문제 목록 (사이드바용)
  const [tasks, setTasks] = useState([]);

  // 현재 선택된 문제 & 에디터 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState("");

  // 실행 결과
  const [output, setOutput] = useState("");
  const [result, setResult] = useState(null); // 채점 결과 객체

  // UI 상태
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // 관리자 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  // 관리자 수정 입력값
  const [editForm, setEditForm] = useState({ title: "", description: "", difficulty: "EASY", baseCode: "", expectedOutput: "" });
  // 관리자용 제출 기록
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  // 1. 초기 로드: 문제 목록 불러오기
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/problems');
        const data = Array.isArray(res.data) ? res.data : [];
        setTasks(data);

        // URL의 ID와 일치하는 문제 찾아서 선택
        if (id && id !== "undefined") {
          const target = data.find(t => t.problemId === Number(id));
          if (target) handleTaskSelect(target);
        } else if (data.length > 0) {
          // ID가 없으면 첫번째 문제 자동 선택 (옵션)
          handleTaskSelect(data[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("문제 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [id]);

  const fetchSubmissions = async (problemId) => {
    try {
      const subRes = await axios.get(`/api/problems/${problemId}/submissions`);
      setSubmissions(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (e) {
      console.error("제출 기록 로드 실패");
    }
  };

  // 변경사항 감지 (학생일 때만)
  const isDirty = userRole !== 'ADMIN' && code !== DEFAULT_CODE && code.trim() !== "";

  // 1. 브라우저 새로고침/닫기 방지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. SPA 내부 이동(뒤로가기, 네비바 등) 방지



  // 문제 선택 핸들러
  const handleTaskSelect = async (task) => {
    // 이미 선택된 경우 중복 호출 방지 (편집 중이 아닐 때만)
    if (selectedTask?.problemId === task.problemId && !isEditing) return;

    // 변경사항 확인 (학생인 경우에만)
    if (isDirty) {
      if (!window.confirm("작성 중인 코드가 사라집니다. 이동하시겠습니까?")) return;
    }

    setSelectedTask(task);
    setResult(null);
    setOutput("");
    setIsEditing(false); // 문제 변경 시 편집 모드 해제
    setShowSubmissions(false);

    // 상세 정보(BaseCode 포함) 다시 조회
    try {
      const res = await axios.get(`/api/problems/${task.problemId}`);
      const detail = res.data;
      setSelectedTask(detail);

      // 코드 초기화
      // 학생: 항상 기본 템플릿 (관리자가 푼 코드 안 보여줌)
      // 관리자: 저장된 코드 보여줌 (없으면 템플릿)
      if (userRole !== 'ADMIN') {
        setCode(DEFAULT_CODE);
      } else {
        setCode(detail.baseCode || DEFAULT_CODE);
      }

      // 수정 폼 초기화
      setEditForm({
        title: detail.title,
        description: detail.description,
        difficulty: detail.difficulty || "EASY",
        baseCode: detail.baseCode || DEFAULT_CODE,
        expectedOutput: detail.expectedOutput || ""
      });

      // 관리자라면 제출 기록 로드
      if (userRole === "ADMIN") {
        fetchSubmissions(task.problemId);
      }

      // URL 업데이트 (페이지 이동 없이)
      navigate(`/coding-test/${task.problemId}`, { replace: true });

    } catch (e) {
      console.error("상세 정보 로드 실패", e);
    }
  };

  // 코드 실행 (단순 Run)
  const handleRun = async () => {
    if (!selectedTask) return;
    setIsRunning(true);
    setOutput("실행 중...");
    setResult(null);

    try {
      const res = await axios.post(`/api/problems/${selectedTask.problemId}/run`, { code });
      const data = res.data;
      setOutput(data.output || "출력값이 없습니다.");
      if (data.error) {
        // 에러 메시지 한글화
        setOutput(`코드를 다시 확인해주세요.\n\n[상세 내용]\n${data.error}`);
      }
    } catch (e) {
      setOutput(`[시스템 오류] ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 코드 제출 (Submit)
  const handleSubmitCode = async () => {
    if (!selectedTask) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await axios.post(`/api/problems/${selectedTask.problemId}/submit`, {
        userId: user.userId,
        code
      });
      const data = res.data;

      setResult(data);
      if (data.passed) {
        toast.success("정답입니다!", { description: `Time: ${data.executionTime}ms` });
        // 목록 상태 업데이트 (성공 표시 등)
        setTasks(prev => prev.map(t => t.problemId === selectedTask.problemId ? { ...t, status: 'PASS' } : t));
      } else {
        // toast.error 제거 및 목록 상태 업데이트
        setTasks(prev => prev.map(t => t.problemId === selectedTask.problemId ? { ...t, status: 'FAIL' } : t));
      }
    } catch (e) {
      toast.error("제출 처리 오류");
    } finally {
      setIsRunning(false);
    }
  };

  // [ADMIN] 문제 수정 저장
  const handleUpdate = async () => {
    try {
      await axios.put(`/api/problems/${selectedTask.problemId}`, {
        ...editForm,
        baseCode: code // 에디터 내용을 baseCode로 저장
      });
      toast.success("문제가 수정되었습니다.");
      setIsEditing(false);
      handleTaskSelect({ ...selectedTask, ...editForm, baseCode: code }); // UI 갱신을 위해 재선택 효과

      // 목록 갱신
      setTasks(prev => prev.map(t => t.problemId === selectedTask.problemId ? { ...t, title: editForm.title, difficulty: editForm.difficulty } : t));
    } catch (e) {
      toast.error("수정 실패: " + e.message);
    }
  };

  // [ADMIN] 문제 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/problems/${selectedTask.problemId}`);
      toast.success("삭제되었습니다.");
      setTasks(prev => prev.filter(t => t.problemId !== selectedTask.problemId));
      if (tasks.length > 1) handleTaskSelect(tasks[0]);
      else setSelectedTask(null);
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        <div className="text-gray-500 text-sm font-medium">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background font-sans text-foreground overflow-hidden">
      <Toaster position="top-right" richColors theme="system" />
      <Nav />
      {/* Nav fixed height compensation */}
      <div className="h-[70px] shrink-0"></div>

      <main className="flex-1 flex overflow-hidden p-4 md:p-6 gap-4 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-purple-500/5 -z-10" />

        {/* Left Sidebar: Problem List */}
        <aside className="w-72 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 flex flex-col overflow-hidden shrink-0 shadow-lg transition-all duration-300">
          <div className="p-4 border-b border-border/50 bg-muted/20">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                <ListTodo className="w-4 h-4" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                문제 목록
              </span>
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {tasks.map((task, idx) => (
                <button
                  key={task.problemId}
                  onClick={() => handleTaskSelect(task)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all duration-200 flex items-start gap-3 group border
                                ${selectedTask?.problemId === task.problemId
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'}
                            `}
                >
                  <div className={`mt-0.5 shrink-0 ${selectedTask?.problemId === task.problemId ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    <StatusIcon status={task.status || (task.passRate > 0 ? 'PASS' : null)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 mb-1">
                      {idx + 1}. {task.title}
                    </div>
                    {task.difficulty && <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${task.difficulty === 'EASY' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                      task.difficulty === 'MEDIUM' ? 'bg-gray-50 text-gray-800 border-gray-300' : 'bg-black text-white border-black'
                      }`}>
                      {getDifficultyLabel(task.difficulty)}
                    </span>}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Center: Coding Workspace */}
        <section className="flex-1 bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden flex flex-col shadow-2xl relative">
          {selectedTask ? (
            <>
              {/* Toolbar */}
              <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 shrink-0">
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <input
                      className="text-lg font-bold bg-transparent border-b-2 border-primary focus:outline-none text-foreground px-1"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg text-gray-900 tracking-tight">{selectedTask.title}</h2>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium border-0 px-2 h-5 text-[10px]">
                        {getDifficultyLabel(selectedTask.difficulty)}
                      </Badge>
                    </div>
                  )}

                  {/* Admin Difficulty Select */}
                  {isEditing && (
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      className="text-xs border rounded p-1 bg-background text-foreground"
                    >
                      <option value="EASY">초급</option>
                      <option value="MEDIUM">중급</option>
                      <option value="HARD">고급</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {userRole === "ADMIN" && !isEditing && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setShowSubmissions(!showSubmissions)} className="h-9 gap-2 text-muted-foreground hover:text-foreground">
                        <History className="w-4 h-4" /> 기록
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setIsEditing(true); }} className="h-9 text-gray-500 hover:text-black hover:bg-gray-50">
                        <Edit className="w-4 h-4" /> 수정
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleDelete} className="h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" /> 삭제
                      </Button>
                    </>
                  )}

                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-9 font-medium"
                      >
                        <Play className="w-4 h-4 mr-2" /> 실행
                      </Button>
                      <Button size="sm" onClick={handleUpdate} className="gap-2">
                        <Save className="w-4 h-4" /> 저장
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* 실행 버튼 (공통) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRun}
                        disabled={isRunning}
                        className="h-9 px-4 font-medium border-border/50 hover:bg-muted/50 transition-all"
                      >
                        <Play className="w-4 h-4 mr-2 text-primary" /> 실행
                      </Button>
                      {/* 학생: 제출 버튼 (관리자는 숨김) */}
                      {userRole !== "ADMIN" && (
                        <Button
                          size="sm"
                          onClick={handleSubmitCode}
                          disabled={isRunning}
                          className="bg-black hover:bg-gray-800 text-white h-9 px-6 font-bold rounded-lg shadow-md transition-all active:scale-95"
                        >
                          {isRunning ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                          제출
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Content Split */}
              <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                  {/* Left: Description or Submission List */}
                  <Panel defaultSize={40} minSize={30} className="flex flex-col h-full">
                    {showSubmissions ? (
                      <div className="h-full bg-white flex flex-col">
                        <div className="px-6 py-3 bg-gray-50 flex items-center border-b border-gray-100 justify-between shrink-0">
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <History className="w-4 h-4" /> 학생 제출 기록
                          </span>
                        </div>
                        <ScrollArea className="flex-1 px-8 py-8">
                          <div className="space-y-4">
                            {submissions.map((sub, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="text-sm">
                                  <div className="font-bold text-foreground">{sub.loginId || "User"}</div>
                                  <div className="text-xs text-muted-foreground">{sub.submittedAt}</div>
                                </div>
                                <Badge variant={sub.status === "PASS" ? "default" : "destructive"} className="shadow-none">{sub.status}</Badge>
                              </div>
                            ))}
                            {submissions.length === 0 && <div className="text-center text-muted-foreground text-sm">기록이 없습니다.</div>}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full w-full">
                        {/* Description (Top - Fixed 65%) */}
                        <div className="h-[65%] flex flex-col bg-white border-b border-gray-200">
                          <div className="px-6 py-3 bg-gray-50 flex items-center border-b border-gray-100 shrink-0">
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5" /> 문제 설명
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col relative">
                            {isEditing ? (
                              <textarea
                                className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm leading-relaxed"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="문제 설명을 입력하세요..."
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full overflow-y-auto p-6">
                                <div className="prose prose-gray prose-sm max-w-none text-gray-700 leading-7">
                                  <p className="whitespace-pre-wrap font-medium text-[15px]">{selectedTask.description}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expected Output (Bottom - Fixed 35%) */}
                        <div className="h-[35%] flex flex-col bg-gray-50/30">
                          <div className="px-6 py-3 bg-gray-50 flex items-center border-b border-gray-100 justify-between shrink-0">
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5" /> 예상 실행 결과 (Expected Output)
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col relative">
                            {isEditing ? (
                              <textarea
                                className="absolute inset-0 w-full h-full border-none p-6 resize-none focus:ring-0 focus:outline-none text-sm font-mono bg-transparent"
                                value={editForm.expectedOutput || ""}
                                onChange={(e) => setEditForm({ ...editForm, expectedOutput: e.target.value })}
                                placeholder="정답 처리를 위한 예상 실행 결과를 입력하세요."
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full overflow-y-auto p-6">
                                {selectedTask.expectedOutput ? (
                                  <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{selectedTask.expectedOutput}</pre>
                                ) : (
                                  <div className="text-gray-400 text-sm italic">등록된 예상 실행 결과가 없습니다.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Panel>

                  <PanelResizeHandle className="w-[1px] bg-border hover:bg-primary transition-colors flex items-center justify-center z-10 group">
                    <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-primary transition-colors" />
                  </PanelResizeHandle>

                  {/* Right: Editor & Console */}
                  <Panel defaultSize={60} minSize={30}>
                    <PanelGroup direction="vertical">
                      {/* Editor Section */}
                      <Panel defaultSize={65} minSize={20} className="flex flex-col">
                        <div className="h-10 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-white/10">
                          <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-1 rounded-md text-gray-200">
                            <Code2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">main.java</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-[#1e1e1e] relative">
                          <Editor
                            defaultLanguage="java"
                            value={code}
                            onChange={setCode}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              fontFamily: "'JetBrains Mono', 'D2Coding', monospace",
                              lineNumbers: 'on',
                              automaticLayout: true,
                              padding: { top: 24, bottom: 24 },
                              scrollBeyondLastLine: false,
                              renderLineHighlight: "line",
                            }}
                          />
                        </div>
                      </Panel>

                      <PanelResizeHandle className="h-[1px] bg-border hover:bg-primary transition-colors" />

                      {/* Console Section */}
                      <Panel defaultSize={35} minSize={10} className="flex flex-col bg-slate-950 text-slate-300">
                        <div className="h-10 border-b border-white/10 bg-slate-900/50 flex items-center px-4">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" /> 실행 결과 (Console)
                          </span>
                        </div>
                        <ScrollArea className="flex-1 p-5 font-mono text-sm">
                          {result ? (
                            <div className={`flex flex-col gap-3 p-5 rounded-xl border ${result.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${result.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                  {result.passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </div>
                                <div className={`font-bold text-lg ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {result.passed ? "테스트 통과!" : "실행 실패 / 오답"}
                                </div>
                              </div>
                              <div className="pl-[44px]">
                                {result.passed && result.executionTime > 0 &&
                                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-background/50 rounded text-xs font-medium text-emerald-400 border border-emerald-500/20">
                                    <Sparkles className="w-3 h-3" />
                                    {result.executionTime}ms
                                  </div>
                                }
                              </div>
                            </div>
                          ) : output ? (
                            <pre className="whitespace-pre-wrap leading-relaxed opacity-90">{output}</pre>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                              <Terminal className="w-10 h-10 opacity-50" />
                              <span className="text-xs font-medium">코드를 실행하면 결과가 텍스트로 출력됩니다.</span>
                            </div>
                          )}
                        </ScrollArea>
                      </Panel>
                    </PanelGroup>
                  </Panel>
                </PanelGroup>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center shadow-inner">
                <AlertCircle className="w-10 h-10 opacity-30" />
              </div>
              <span className="font-medium text-lg">왼쪽 목록에서 문제를 선택해주세요.</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CodingTestDetail;