import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Input } from '@/components/ui/Input';
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, CheckCircle2, HelpCircle,
  User, BookOpen, Clock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const InstructorQnaList = () => {
  const navigate = useNavigate();
  const [qnaList, setQnaList] = useState([]);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'unanswered'

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchQnaList = async () => {
    try {
      const res = await fetch('/instructor/qna', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQnaList(data);
    } catch (e) {
      console.error("Failed fetch qna list", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQnaList();
    }
  }, [user]);

  // Filter Logic
  const getFilteredList = () => {
    let filtered = [...qnaList];

    if (viewMode === 'unanswered') {
      filtered = filtered.filter(q => q.status !== 'ANSWERED' && (!q.answers || q.answers.length === 0));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(lower) ||
        q.question.toLowerCase().includes(lower) ||
        (q.courseTitle && q.courseTitle.toLowerCase().includes(lower))
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };
  const filteredQnaList = getFilteredList();

  const totalCount = qnaList.length;
  const unansweredCount = qnaList.filter(q => q.status !== 'ANSWERED' && (!q.answers || q.answers.length === 0)).length;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <Nav />
      <div className="h-4"></div>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-0">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Filter Menu */}
            <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-xl p-2 shadow-sm">
              <nav className="space-y-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'all'
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    전체 질문
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{totalCount}</span>
                    {viewMode === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('unanswered')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'unanswered'
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    답변 대기
                  </div>
                  <div className="flex items-center gap-2">
                    {unansweredCount > 0 && (
                      <span className="text-xs bg-orange-400/20 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
                        {unansweredCount}
                      </span>
                    )}
                    {viewMode === 'unanswered' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </button>
              </nav>
            </div>

            {/* Helper Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-xl border border-purple-500/20 shadow-sm">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                강사 안내
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                학생들의 질문에 답변을 남겨주세요. 답변 대기 중인 질문을 우선적으로 확인해보세요.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-end">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">QnA 관리</h1>
                <p className="text-muted-foreground">
                  {viewMode === 'unanswered' ? '답변이 필요한 질문들의 목록입니다.' : '학생들이 등록한 질문 목록입니다.'}
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background transition-all"
                  placeholder="제목, 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredQnaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-background/40 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {viewMode === 'unanswered' ? '답변 대기 중인 질문이 없습니다' : '등록된 질문이 없습니다'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewMode === 'unanswered' ? '모든 질문에 답변이 완료되었습니다!' : '아직 학생들이 질문을 등록하지 않았습니다.'}
                  </p>
                </div>
              ) : (
                filteredQnaList.map(qna => {
                  const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
                  const answerCount = qna.answers ? qna.answers.length : 0;

                  return (
                    <div
                      key={qna.qnaId}
                      onClick={() => navigate(`/instructor/qna/${qna.qnaId}`)}
                      className="group relative bg-background/60 backdrop-blur-md rounded-xl border border-border/50 p-6 cursor-pointer hover:bg-background/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isSolved ? 'bg-green-500' : 'bg-orange-400'}`} />

                      <div className="flex items-start gap-5 pl-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {qna.courseTitle && (
                              <Badge variant="outline" className="bg-muted/50 text-muted-foreground font-normal border-border/50">
                                {qna.courseTitle}
                              </Badge>
                            )}
                            <Badge variant={isSolved ? "default" : "secondary"} className={`${isSolved ? "bg-green-500 hover:bg-green-600" : "bg-orange-400/10 text-orange-500 hover:bg-orange-400/20"}`}>
                              {isSolved ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />해결됨</span> : "답변 대기"}
                            </Badge>
                          </div>

                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 pr-4">
                            {qna.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {qna.question}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1 font-medium text-foreground/80">
                              <User className="h-3 w-3" />
                              {qna.userName || '익명'}
                            </span>
                            <div className="w-px h-3 bg-border"></div>
                            <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Side Answer Count */}
                        <div className="hidden sm:flex flex-col items-center justify-center min-w-[4rem] self-center">
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${answerCount > 0
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-muted/30 border-border/50 text-muted-foreground'
                            }`}>
                            <span className="text-lg font-bold leading-none">{answerCount}</span>
                            <MessageCircle className="h-3 w-3 mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>

      <Tail />
    </div>
  );
};

export default InstructorQnaList;
