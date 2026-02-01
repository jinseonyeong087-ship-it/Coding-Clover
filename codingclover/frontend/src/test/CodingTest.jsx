import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import {
  Play, Send, Code2, Terminal,
  ChevronLeft, ChevronRight, Check, X,
  RotateCcw, GripVertical, BookOpen, LayoutDashboard, ListTodo, AlertCircle, Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster, toast } from 'sonner';

// --- Mock Data: Curriculum Context ---
const COURSE_INFO = {
  title: "자바 알고리즘 마스터 클래스",
  chapter: "실전 문제 풀이",
  progress: 0
};

// --- Components ---

const StatusIcon = ({ status }) => {
  if (status === 'PASS') return <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center"><Check className="w-3 h-3 text-violet-600" /></div>;
  if (status === 'FAIL') return <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center"><X className="w-3 h-3 text-rose-600" /></div>;
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300" />;
};

const Navbar = () => (
  <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex items-center justify-between px-6 shrink-0 relative z-20 sticky top-0">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-zinc-900 font-bold text-xl tracking-tight cursor-pointer group">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
          <Code2 className="w-5 h-5" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-800">Coding Clover</span>
      </div>

      <div className="h-6 w-[1px] bg-zinc-200" />

      <div className="hidden md:flex flex-col">
        <div className="flex items-center text-xs text-zinc-500 gap-1 font-medium">
          <LayoutDashboard className="w-3 h-3 text-violet-400" />
          <span>내 강의실</span>
          <ChevronRight className="w-3 h-3" />
          <span>{COURSE_INFO.title}</span>
        </div>
        <h2 className="text-sm font-bold text-zinc-800 mt-0.5">{COURSE_INFO.chapter}</h2>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <Button variant="ghost" className="text-zinc-500 hover:text-violet-600 hover:bg-violet-50 font-medium">
        강의 목록으로
      </Button>
    </div>
  </header>
);

export default function CodingTest() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Problem List from Backend
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch('/api/problems');
        if (!res.ok) throw new Error('Failed to fetch problems');
        const data = await res.json();
        setTasks(data);
        if (data.length > 0) handleTaskSelect(data[0]);
      } catch (err) {
        console.error(err);
        toast.error("문제 목록을 불러오지 못했습니다.", { description: "서버 연결을 확인해주세요." });
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setResult(null);
    setOutput("");
    setCode(`// [${task.title}] 풀이\n// 문제 설명: ${task.description}\n\npublic class Main {\n    public static void main(String[] args) {\n        // TODO: 이곳에 코드를 작성하세요.\n        System.out.println("Hello World!");\n    }\n}`);
  };

  const handleRun = async () => {
    if (!selectedTask) return;
    setIsRunning(true);
    setOutput("실행 중...");
    setResult(null);

    try {
      const res = await fetch(`/api/problems/${selectedTask.problemId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (res.ok) {
        setOutput(data.output || "출력값이 없습니다.");
        if (data.error) setOutput(`[Error]\n${data.error}`);
      } else {
        setOutput(`[Server Error] ${res.statusText}`);
      }
    } catch (e) {
      setOutput(`[Connection Error] ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setIsRunning(true);
    setResult(null);
    const userId = 1;

    try {
      const res = await fetch(`/api/problems/${selectedTask.problemId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.passed) {
          toast.success("정답입니다!", { icon: "🎉", description: `소요 시간: ${data.executionTime}ms` });
          setTasks(prev => prev.map(t => t.problemId === selectedTask.problemId ? { ...t, status: 'PASS' } : t));
        } else {
          toast.error("오답입니다.", { description: data.message });
          setTasks(prev => prev.map(t => t.problemId === selectedTask.problemId ? { ...t, status: 'FAIL' } : t));
        }
      } else {
        toast.error("제출 실패", { description: "서버 오류가 발생했습니다." });
      }
    } catch (e) {
      toast.error("연결 실패", { description: "서버에 연결할 수 없습니다." });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
        <div className="text-zinc-400 text-sm font-medium">강의실 입장 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-50 font-sans text-zinc-900">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">
        {/* Left Sidebar: Assignment List */}
        <aside className="w-72 bg-white rounded-3xl border border-zinc-200/60 shadow-xl shadow-zinc-200/50 flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <div className="p-1.5 bg-violet-100 rounded-md text-violet-600">
                <ListTodo className="w-4 h-4" />
              </div>
              실습 과제 목록
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {tasks.map((task, idx) => (
                <button
                  key={task.problemId}
                  onClick={() => handleTaskSelect(task)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 flex items-start gap-3 group border border-transparent
                                ${selectedTask?.problemId === task.problemId
                      ? 'bg-violet-50 border-violet-100/50 text-violet-900 shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:border-zinc-100'}
                            `}
                >
                  <div className={`mt-0.5 ${selectedTask?.problemId === task.problemId ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    <StatusIcon status={task.status} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium line-clamp-1 ${selectedTask?.problemId === task.problemId ? 'font-bold' : ''}`}>
                      {idx + 1}. {task.title}
                    </div>
                    {task.difficulty && <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-zinc-200 text-zinc-500">
                      {task.difficulty}
                    </span>}
                  </div>
                </button>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                    <ListTodo className="w-6 h-6 text-zinc-300" />
                  </div>
                  <span className="text-zinc-400 text-xs">등록된 과제가 없습니다.</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Center: Coding Workspace */}
        <section className="flex-1 bg-white rounded-3xl border border-zinc-200/60 shadow-xl shadow-zinc-200/40 overflow-hidden flex flex-col ring-1 ring-black/5">
          {selectedTask ? (
            <>
              {/* Toolbar */}
              <div className="h-16 border-b border-zinc-100/80 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg text-zinc-900 tracking-tight">{selectedTask.title}</h2>
                      {selectedTask.difficulty && (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 font-medium border-0 px-2 h-5 text-[10px]">
                          {selectedTask.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRun}
                    disabled={isRunning}
                    className="bg-zinc-100/80 hover:bg-zinc-200 text-zinc-600 h-9 px-4 font-semibold rounded-xl border border-zinc-200/50"
                  >
                    <Play className="w-4 h-4 mr-2 fill-zinc-600" /> 실행 테스트
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-9 px-6 font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                  >
                    {isRunning ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    코드 제출
                  </Button>
                </div>
              </div>

              {/* Content Split */}
              <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                  {/* Problem Description */}
                  <Panel defaultSize={40} minSize={30}>
                    <div className="h-full bg-white flex flex-col">
                      <div className="px-6 py-3 bg-zinc-50/50 flex items-center border-b border-zinc-100">
                        <span className="text-xs font-bold text-violet-600 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> 문제 지침
                        </span>
                      </div>
                      <ScrollArea className="flex-1 px-8 py-8">
                        <div className="prose prose-zinc prose-sm max-w-none text-zinc-600 leading-7">
                          <p className="whitespace-pre-wrap font-medium text-[15px] text-zinc-800">{selectedTask.content || selectedTask.description}</p>
                        </div>
                      </ScrollArea>
                    </div>
                  </Panel>

                  <PanelResizeHandle className="w-[1px] bg-zinc-200 hover:bg-violet-400 transition-colors flex items-center justify-center z-10">
                    <div className="w-1.5 h-16 bg-zinc-200 rounded-full hover:bg-violet-400 transition-colors"></div>
                  </PanelResizeHandle>

                  {/* Editor & Console */}
                  <Panel defaultSize={60} minSize={30}>
                    <PanelGroup direction="vertical">
                      <Panel defaultSize={65} minSize={20} className="flex flex-col">
                        <div className="h-10 flex items-center justify-between px-4 bg-zinc-50/50 border-b border-zinc-100">
                          <div className="flex items-center gap-2 bg-white border border-zinc-200/60 px-2.5 py-1 rounded-lg">
                            <Code2 className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-semibold text-zinc-600">Main.java</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <Editor
                            defaultLanguage="java"
                            value={code}
                            onChange={setCode}
                            theme="vs-light"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              fontFamily: "'JetBrains Mono', 'D2Coding', monospace",
                              lineNumbers: 'on',
                              automaticLayout: true,
                              padding: { top: 24, bottom: 24 },
                              renderLineHighlight: 'all', // 현재 라인 강조
                              smoothScrolling: true
                            }}
                          />
                        </div>
                      </Panel>

                      <PanelResizeHandle className="h-[1px] bg-zinc-200" />

                      <Panel defaultSize={35} minSize={10} className="flex flex-col bg-slate-50">
                        <div className="h-10 border-b border-zinc-200 bg-white flex items-center px-4">
                          <span className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" /> 실행 콘솔
                          </span>
                        </div>
                        <ScrollArea className="flex-1 p-5">
                          {result ? (
                            <div className={`flex flex-col gap-3 p-5 rounded-2xl border ${result.passed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                  {result.passed ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className={`font-bold text-lg ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}>{result.passed ? "테스트 통과!" : "오답입니다"}</div>
                                </div>
                              </div>
                              <div className="pl-[52px]">
                                <p className="text-sm text-zinc-600 mb-2">{result.message}</p>
                                {result.executionTime > 0 &&
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-zinc-200 text-xs font-medium text-zinc-500">
                                    <Sparkles className="w-3 h-3 text-violet-500" />
                                    실행 시간: <span className="text-zinc-700">{result.executionTime}ms</span>
                                  </div>
                                }
                              </div>
                            </div>
                          ) : output ? (
                            <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-zinc-200/60 shadow-sm">{output}</pre>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3 opacity-60">
                              <Terminal className="w-8 h-8" />
                              <span className="text-xs font-medium">실행 버튼을 눌러 결과를 확인하세요.</span>
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
            <div className="flex-1 flex items-center justify-center text-zinc-400 flex-col gap-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-zinc-100">
                <AlertCircle className="w-8 h-8 opacity-20 text-violet-500" />
              </div>
              <span className="font-medium text-zinc-500">왼쪽 목록에서 과제를 선택해주세요.</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
