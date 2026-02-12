import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, CheckCircle2, HelpCircle,
  Plus, User, BookOpen, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const StudentQnaList = () => {
  const navigate = useNavigate();
  const [qnaList, setQnaList] = useState([]);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [courseId, setCourseId] = useState('');
  const [user, setUser] = useState(null);
  const [courseList, setCourseList] = useState([]); // Enrolled courses
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my'

  // 검색 및 페이징 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    // 유저 정보 가져오기
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
    }

    // URL 파라미터 체크 (tab=my)
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'my') {
      setViewMode('my');
    }
  }, []);

  const fetchQnaList = async () => {
    try {
      let url = '/student/qna';
      if (viewMode === 'my') {
        if (!user) {
          setQnaList([]);
          return;
        }
        url = `/student/qna/my?userId=${user.userId || user.id}`;
      }

      const response = await axios.get(url);
      setQnaList(response.data);
      setCurrentPage(1); // 모드 변경 시 첫 페이지로
    } catch (e) {
      console.error("Failed fetch qna list", e);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [viewMode, user]);

  // Fetch enrolled courses for the dropdown
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await axios.get('/student/enrollment', { withCredentials: true });
        setCourseList(response.data);
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
      }
    };
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인이 필요합니다.');
    if (!courseId) return alert('강좌를 선택해주세요.');

    const qnaData = {
      title,
      question,
      userId: user.userId || user.id,
      courseId: Number(courseId)
    };

    try {
      const response = await axios.post('/student/qna/add', qnaData);
      if (response.status === 200) {
        alert('질문이 등록되었습니다.');
        setTitle('');
        setQuestion('');
        setCourseId('');
        setIsWriteModalOpen(false);
        fetchQnaList();
      }
    } catch (error) {
      alert('에러 발생');
    }
  };

  // Filter Logic
  const getFilteredList = () => {
    let filtered = [...qnaList];
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQnaList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQnaList.length / itemsPerPage);

  const handlePageChange = (n) => setCurrentPage(n);

  return (
    <>
      <Nav />
      <div className="h-16"></div>
      <div className="min-h-screen bg-white pb-20">
        <div className="container mx-auto px-4 max-w-7xl pt-12">
          <main className="min-w-0">
            <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QnA 게시판</h1>
                <p className="text-gray-500">
                  {viewMode === 'my' ? '내가 작성한 질문들의 목록입니다.' : '함께 배우고 성장하는 지식 공유의 공간입니다.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {(!user || user.role !== 'ADMIN') && (
                  <Button
                    onClick={() => {
                      if (!user) return alert("로그인이 필요합니다.");
                      setIsWriteModalOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md h-11 px-6 rounded-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    새 질문 작성
                  </Button>
                )}

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    className="pl-10 h-11 bg-white border-gray-200 focus:bg-white transition-all shadow-sm"
                    placeholder="검색어 입력..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${viewMode === 'all'
                  ? 'bg-[#4a6fa5] text-white border-[#4a6fa5]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                전체 질문
              </button>
              <button
                onClick={() => {
                  if (!user) return alert('로그인이 필요합니다.');
                  setViewMode('my');
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${viewMode === 'my'
                  ? 'bg-[#4a6fa5] text-white border-[#4a6fa5]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                내 질문
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {currentItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">등록된 질문이 없습니다</p>
                  <p className="text-sm text-gray-500 mt-1">첫 번째 질문의 주인공이 되어보세요!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentItems.map(qna => {
                      const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
                      const answerCount = qna.answers ? qna.answers.length : 0;

                      return (
                        <div
                          key={qna.qnaId}
                          onClick={() => navigate(`/student/qna/${qna.qnaId}`)}
                          className="group relative bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                        >
                          <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isSolved ? 'bg-green-500' : 'bg-amber-400'}`} />
                          <div className="flex items-start gap-5 pl-3">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {qna.courseTitle && (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-600 font-normal border-gray-200">
                                    {qna.courseTitle}
                                  </Badge>
                                )}
                                <Badge variant={isSolved ? "default" : "secondary"} className={`${isSolved ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-0"}`}>
                                  {isSolved ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />해결됨</span> : <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />미해결</span>}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 pr-4">
                                {qna.title}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                {qna.question}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
                                <span className="flex items-center gap-1 font-medium text-gray-600">
                                  <User className="h-3 w-3" />
                                  {qna.userName || '익명'}
                                </span>
                                <div className="w-px h-3 bg-gray-200"></div>
                                <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="hidden sm:flex flex-col items-center justify-center min-w-[4rem] self-center">
                              <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${answerCount > 0
                                ? 'bg-primary/5 border-primary/20 text-primary'
                                : 'bg-gray-50 border-gray-100 text-gray-400'
                                }`}>
                                <span className="text-lg font-bold leading-none">{answerCount}</span>
                                <MessageCircle className="h-3 w-3 mt-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 pt-8">
                      <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <Button
                          key={p}
                          variant={currentPage === p ? "default" : "ghost"}
                          size="sm"
                          className="w-9 h-9 font-bold"
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Write Modal */}
      <Dialog open={isWriteModalOpen} onOpenChange={setIsWriteModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">새로운 질문 작성</DialogTitle>
            <DialogDescription className="text-gray-500">
              궁금한 점을 자세히 적어주세요. 상세한 질문은 더 좋은 답변을 받습니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseId" className="font-semibold text-gray-700">강좌 선택</Label>
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">강좌를 선택해주세요 (수강 중인 강좌만 표시됩니다)</option>
                {courseList.length === 0 && <option disabled>수강 중인 강좌가 없습니다.</option>}
                {courseList.map((course) => (
                  <option key={course.courseId} value={course.courseId}>{course.courseTitle}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-gray-700">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="핵심 내용을 요약해주세요"
                className="h-11 bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question" className="font-semibold text-gray-700">내용</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none leading-relaxed"
                value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="질문 내용을 자세히 입력해주세요. 코드나 에러 메시지를 포함하면 좋습니다."
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsWriteModalOpen(false)}>취소</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">등록하기</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Tail />
    </>
  );
};

export default StudentQnaList;
