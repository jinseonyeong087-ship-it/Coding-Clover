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
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my_pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [myCourseIds, setMyCourseIds] = useState(new Set());

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

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('/instructor/course', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      const ids = new Set(data.map(c => c.courseId));
      setMyCourseIds(ids);
    } catch (e) {
      console.error("Failed to fetch courses", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQnaList();
      fetchMyCourses();
    }
  }, [user]);

  // Filter Logic
  const getFilteredList = () => {
    // Filter by ownership (only QnAs for my courses)
    let filtered = qnaList.filter(q => myCourseIds.has(q.courseId));

    // "나의 답변 대기" logic: filter for unanswered questions
    // Backend '/instructor/qna' is expected to return questions for this instructor's courses.
    if (viewMode === 'my_pending') {
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
  // Calculate counts based on OWNERSHIP
  const myOwnedQnaList = qnaList.filter(q => myCourseIds.has(q.courseId));
  const totalCount = myOwnedQnaList.length;
  // Count of unanswered questions for this instructor
  const myPendingCount = myOwnedQnaList.filter(q => q.status !== 'ANSWERED' && (!q.answers || q.answers.length === 0)).length;

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <Nav />
      <div className="h-0"></div>

      <main className="container mx-auto px-4 py-8 max-w-[1600px] relative z-0">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Filter Menu */}
            <div className="bg-white border border-border/50 rounded-xl p-2 shadow-sm">
              <nav className="space-y-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'all'
                    ? 'bg-[#4a6fa5] text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    전체 질문
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{totalCount}</span>
                  </div>
                </button>

                <button
                  onClick={() => setViewMode('my_pending')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'my_pending'
                    ? 'bg-[#4a6fa5] text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    나의 답변 대기
                  </div>
                  <div className="flex items-center gap-2">
                    {myPendingCount > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${viewMode === 'my_pending' ? 'bg-white text-[#4a6fa5]' : 'bg-orange-100 text-orange-600'}`}>
                        {myPendingCount}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            {/* Helper Card */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-black" />
                강사 안내
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                본인 강좌에 등록된 질문만 표시됩니다. 학생들의 질문에 답변을 남겨주세요.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-end">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">QnA 관리</h1>
                <p className="text-gray-500">
                  {viewMode === 'my_pending' ? '답변이 필요한 내 강좌의 질문 목록입니다.' : '내 강좌에 등록된 모든 질문 목록입니다.'}
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  className="pl-10 h-11 bg-white border-gray-200 focus:bg-white transition-all"
                  placeholder="제목, 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredQnaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {viewMode === 'my_pending' ? '답변 대기 중인 질문이 없습니다' : '등록된 질문이 없습니다'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewMode === 'my_pending' ? '모든 질문에 답변이 완료되었습니다!' : '아직 학생들이 질문을 등록하지 않았습니다.'}
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
                      className="group relative bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300"
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isSolved ? 'bg-green-500' : 'bg-red-500'}`} />

                      <div className="flex items-start gap-5 pl-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {qna.courseTitle && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 font-normal border-gray-200">
                                {qna.courseTitle}
                              </Badge>
                            )}
                            <Badge variant={isSolved ? "default" : "secondary"} className={`${isSolved ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : "bg-red-100 text-red-700 hover:bg-red-200 border-0"}`}>
                              {isSolved ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />해결됨</span> : "답변 대기"}
                            </Badge>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 pr-4">
                            {qna.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {qna.question}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                            <span className="flex items-center gap-1 font-medium text-gray-600">
                              <User className="h-3 w-3" />
                              {qna.userName || '익명'}
                            </span>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Side Answer Count */}
                        <div className="hidden sm:flex flex-col items-center justify-center min-w-[4rem] self-center">
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${answerCount > 0
                            ? 'bg-blue-50 border-blue-100 text-blue-600'
                            : 'bg-gray-50 border-gray-100 text-gray-400'
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
