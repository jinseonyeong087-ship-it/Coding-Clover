import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, CheckCircle2, HelpCircle,
  Plus, ChevronRight, User, Calendar, BookOpen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";

const StudentQnaList = () => {
  const navigate = useNavigate();
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [courseList, setCourseList] = useState([]);

  // Filters
  const [filterType, setFilterType] = useState('all'); // 'all', 'my', 'solved', 'unsolved'
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New Question Form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQna, setNewQna] = useState({ title: '', question: '', courseId: '' });

  useEffect(() => {
    // Fetch User
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Fetch Courses for Dropdown
    fetch('/course').then(res => res.json()).then(data => setCourseList(data));

    // Fetch QnA List
    fetchQnaList();
  }, []);

  const fetchQnaList = async () => {
    setLoading(true);
    try {
      // In a real scenario, you might want server-side filtering. 
      // For now, fetching all and filtering client-side or using the simple 'my' endpoint.
      let url = '/student/qna';
      const res = await axios.get(url, { withCredentials: true });
      setQnaList(res.data);
    } catch (err) {
      console.error("Failed to fetch QnA:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQna = async () => {
    if (!currentUser) return alert("로그인이 필요합니다.");
    if (!newQna.courseId) return alert("강좌를 선택해주세요.");
    if (!newQna.title || !newQna.question) return alert("제목과 내용을 입력해주세요.");

    try {
      await axios.post('/student/qna/add', {
        ...newQna,
        userId: currentUser.userId || currentUser.id,
        courseId: Number(newQna.courseId)
      }, { withCredentials: true });

      alert("질문이 등록되었습니다.");
      setIsDialogOpen(false);
      setNewQna({ title: '', question: '', courseId: '' });
      fetchQnaList();
    } catch (err) {
      console.error(err);
      alert("등록 실패");
    }
  };

  // Filter Logic
  const getFilteredPosts = () => {
    let filtered = [...qnaList];

    // 1. Text Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(lower) ||
        q.question.toLowerCase().includes(lower) ||
        (q.courseTitle && q.courseTitle.toLowerCase().includes(lower))
      );
    }

    // 2. Sidebar Filter
    if (filterType === 'my' && currentUser) {
      filtered = filtered.filter(q => q.userId === (currentUser.userId || currentUser.id));
    } else if (filterType === 'solved') {
      filtered = filtered.filter(q => q.status === 'ANSWERED' || q.answers?.length > 0);
    } else if (filterType === 'unsolved') {
      filtered = filtered.filter(q => (!q.status || q.status === 'WAIT') && (!q.answers || q.answers.length === 0));
    }

    // 3. Course Filter
    if (selectedCourseId !== 'all') {
      filtered = filtered.filter(q => q.courseId === Number(selectedCourseId));
    }

    // Sort by Newest
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  };

  const displayPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Nav />
      <div className="h-16"></div> {/* Spacer for fixed nav if needed, or just padding */}

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            {/* Write Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-base font-bold bg-[#5d5feF] hover:bg-[#4b4ddb] shadow-md transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  질문하기
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>새로운 질문 작성</DialogTitle>
                  <DialogDescription>
                    궁금한 점을 자세히 적어주세요. 강사님과 다른 수강생들이 답변해드립니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>강좌 선택</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newQna.courseId}
                      onChange={(e) => setNewQna({ ...newQna, courseId: e.target.value })}
                    >
                      <option value="">질문할 강좌를 선택하세요</option>
                      {courseList.map(c => (
                        <option key={c.courseId} value={c.courseId}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>제목</Label>
                    <Input
                      placeholder="핵심 내용을 요약해주세요"
                      value={newQna.title}
                      onChange={(e) => setNewQna({ ...newQna, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>내용</Label>
                    <Textarea
                      placeholder="코드 에러가 발생했다면 에러 메시지와 코드를 함께 첨부해주세요."
                      className="min-h-[200px]"
                      value={newQna.question}
                      onChange={(e) => setNewQna({ ...newQna, question: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                  <Button onClick={handleCreateQna} className="bg-[#5d5feF]">등록하기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setFilterType('all')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${filterType === 'all' ? 'bg-white text-[#5d5feF] shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  전체 질문
                </div>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {qnaList.length}
                </span>
              </button>

              <button
                onClick={() => currentUser ? setFilterType('my') : alert('로그인이 필요합니다.')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${filterType === 'my' ? 'bg-white text-[#5d5feF] shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  내 질문
                </div>
              </button>

              <FilterButton
                isActive={filterType === 'unsolved'}
                onClick={() => setFilterType('unsolved')}
                icon={<HelpCircle className="h-4 w-4" />}
                label="해결 중인 질문"
                count={qnaList.filter(q => (!q.status || q.status === 'WAIT') && (!q.answers || q.answers.length === 0)).length}
              />

              <FilterButton
                isActive={filterType === 'solved'}
                onClick={() => setFilterType('solved')}
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="해결된 질문"
                count={qnaList.filter(q => q.status === 'ANSWERED' || q.answers?.length > 0).length}
              />
            </nav>

            {/* Course Filter Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">강좌별 모아보기</h3>
              <select
                className="w-full h-10 rounded-md border border-gray-200 text-sm px-3 text-gray-600 focus:outline-none focus:border-[#5d5feF] transition-colors"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="all">모든 강좌</option>
                {courseList.map(course => (
                  <option key={course.courseId} value={course.courseId}>{course.title}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QnA 게시판</h1>
                <p className="text-gray-500 text-sm mt-1">지식 공유의 장, 서로 묻고 답하며 함께 성장하세요.</p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 bg-white border-gray-200 focus:ring-[#5d5feF]"
                  placeholder="제목, 내용, 강좌명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Question List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-20 text-gray-500">로딩 중...</div>
              ) : displayPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                  <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900">등록된 질문이 없습니다</p>
                  <p className="text-sm text-gray-500">첫 번째 질문을 남겨보세요!</p>
                </div>
              ) : (
                displayPosts.map((qna) => (
                  <QnaCard key={qna.qnaId} qna={qna} onClick={() => navigate(`/student/qna/${qna.qnaId}`)} />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <Tail />
    </div>
  );
};

const FilterButton = ({ isActive, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-white text-[#5d5feF] shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
      }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    {count !== undefined && (
      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    )}
  </button>
);

const QnaCard = ({ qna, onClick }) => {
  const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
  const answerCount = qna.answers ? qna.answers.length : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-[#5d5feF] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={`mt-1 shrink-0 ${isSolved ? 'text-green-500' : 'text-gray-300'}`}>
          {isSolved ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <HelpCircle className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Course Badge */}
            {qna.courseTitle && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">
                {qna.courseTitle}
              </Badge>
            )}
            {/* Status Badge */}
            <div className={`text-xs font-bold px-2 py-0.5 rounded ${isSolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
              {isSolved ? '해결됨' : '미해결'}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5d5feF] transition-colors mb-2 line-clamp-1">
            {qna.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {qna.question}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600">{qna.userName || '익명'}</span>
            </div>
            <div className="w-px h-3 bg-gray-200"></div>
            <span>{new Date(qna.createdAt).toLocaleDateString()}</span>

            {/* Answer Count (Small) */}
            {answerCount > 0 && (
              <>
                <div className="w-px h-3 bg-gray-200"></div>
                <div className="flex items-center gap-1 text-[#5d5feF] font-medium">
                  <MessageCircle className="h-3.5 w-3.5" />
                  답변 {answerCount}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden sm:block self-center">
          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${isSolved ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
            <span className="text-xl font-bold leading-none">{answerCount}</span>
            <span className="text-[10px] mt-1">답변</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQnaList;
