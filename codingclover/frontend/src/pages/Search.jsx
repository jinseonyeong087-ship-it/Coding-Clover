import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, Terminal, Search as SearchIcon } from "lucide-react";
import { Button } from '@/components/ui/button';

function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  // 탭 메뉴 리스트
  const categories = [
    { id: 'COURSE', name: '강좌' },
    { id: 'LECTURE', name: '강의' },
    { id: 'CODING_TEST', name: '코딩테스트' },
    { id: 'COMMUNITY', name: '커뮤니티' },
    { id: 'QNA', name: 'Q&A' },
    { id: 'NOTICE', name: '공지사항' },
  ];

  useEffect(() => {
    if (keyword) {
      setLoading(true);
      const storedUsers = localStorage.getItem("users");
      const userRole = storedUsers ? JSON.parse(storedUsers).role : 'GUEST';

      const fetchPromises = categories.map(cat =>
        axios.get('/api/search', {
          params: { category: cat.id, keyword, role: userRole }
        }).then(res => ({ id: cat.id, data: res.data.content || [] }))
          .catch(err => {
            console.error(`${cat.id} 검색 실패`, err);
            return { id: cat.id, data: [] };
          })
      );

      Promise.all(fetchPromises)
        .then(responses => {
          const newResults = {};
          responses.forEach(r => {
            newResults[r.id] = r.data;
          });
          setResults(newResults);
        })
        .finally(() => setLoading(false));
    }
  }, [keyword]);

  const renderCourseGrid = (items) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <Link to={`/course/${item.id}`} key={item.id} className="group block h-full">
            <div className="h-full bg-white border border-gray-200 hover:border-primary transition-colors flex flex-col rounded-none">
              <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden group-hover:bg-gray-50 transition-colors">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Code2 className="w-12 h-12" />
                  </div>
                )}
                {item.level && (
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="secondary" className="rounded-none bg-white/90 text-gray-800 hover:bg-white border border-gray-200">
                      Level {item.level}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                <div className="text-xs font-medium text-gray-400 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span>{item.instructorName || 'Instructor'}</span>
                  <span className="text-primary group-hover:underline flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // 테이블 헤더 설정
  const renderHeader = (categoryId) => {
    switch (categoryId) {
      case 'COMMUNITY':
      case 'QNA':
      case 'NOTICE':
        return (
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="text-center w-16 text-gray-500 font-bold">No</TableHead>
            <TableHead className="text-center text-gray-500 font-bold">제목</TableHead>
            <TableHead className="text-center w-32 text-gray-500 font-bold">작성자</TableHead>
            <TableHead className="text-center w-32 text-gray-500 font-bold">작성일</TableHead>
          </TableRow>
        );
      case 'STUDENT':
      case 'INSTRUCTOR':
        return (
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="text-center w-16 text-gray-500 font-bold">No</TableHead>
            <TableHead className="text-center text-gray-500 font-bold">이름</TableHead>
            <TableHead className="text-center text-gray-500 font-bold">아이디</TableHead>
            <TableHead className="text-center text-gray-500 font-bold">이메일</TableHead>
          </TableRow>
        );
      default:
        return (
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="text-center w-16 text-gray-500 font-bold">No</TableHead>
            <TableHead className="text-center text-gray-500 font-bold">제목</TableHead>
            <TableHead className="text-center w-32 text-gray-500 font-bold">날짜</TableHead>
          </TableRow>
        );
    }
  };

  // 테이블 행 데이터 설정
  const renderRows = (item, categoryId, index) => {
    const dateStr = (item.regDate || item.createdAt)?.split('T')[0] || '-';
    const linkPath = `/${categoryId.toLowerCase()}/${item.postId || item.qnaId || item.noticeId || item.id}`;
    const title = item.title || item.subject || "제목 없음";
    const author = item.authorName || item.writer || item.user?.name || (categoryId === 'NOTICE' ? '관리자' : '익명');

    switch (categoryId) {
      case 'COMMUNITY':
      case 'QNA':
      case 'NOTICE':
        return (
          <>
            <TableCell className="text-center text-gray-400">{item.postId || item.qnaId || item.noticeId || item.id}</TableCell>
            <TableCell className="text-left font-medium">
              <Link to={linkPath} className="hover:text-primary hover:underline transition-colors block py-1">
                {title}
              </Link>
            </TableCell>
            <TableCell className="text-center text-gray-600 font-medium">{author}</TableCell>
            <TableCell className="text-center text-gray-400 text-sm">{dateStr}</TableCell>
          </>
        );
      case 'STUDENT':
      case 'INSTRUCTOR':
        return (
          <>
            <TableCell className="text-center text-gray-400">{item.userId || item.id}</TableCell>
            <TableCell className="text-center font-medium">{item.name}</TableCell>
            <TableCell className="text-center text-gray-600">{item.loginId}</TableCell>
            <TableCell className="text-center text-gray-500">{item.email}</TableCell>
          </>
        );
      default: // CODING_TEST etc.
        return (
          <>
            <TableCell className="text-center text-gray-400">{item.id || item.problemId}</TableCell>
            <TableCell className="text-left font-medium">
              <Link to={`/coding-test/${item.id || item.problemId}`} className="hover:text-primary hover:underline transition-colors block py-1">
                {item.title}
              </Link>
            </TableCell>
            <TableCell className="text-center text-gray-400 text-sm">{dateStr}</TableCell>
          </>
        );
    }
  };

  const hasAnyResults = Object.values(results).some(list => list && list.length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav />
      {/* Search Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
              <span className="text-primary">"{keyword}"</span> 검색 결과
            </h2>
            <p className="text-gray-500">
              Coding-Clover에서 관련된 콘텐츠를 확인하세요.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="h-8 w-48 bg-gray-100 animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse"></div>)}
            </div>
          </div>
        ) : hasAnyResults ? (
          <div className="space-y-16 max-w-6xl mx-auto">
            {categories.map((cat) => {
              const catData = results[cat.id] || [];
              if (catData.length === 0) return null;

              return (
                <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {cat.name}
                      <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold text-white bg-primary rounded-none">
                        {catData.length}
                      </span>
                    </h3>
                  </div>

                  {cat.id === 'COURSE' ? (
                    renderCourseGrid(catData)
                  ) : (
                    <div className="border border-gray-200 bg-white">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          {renderHeader(cat.id)}
                        </TableHeader>
                        <TableBody>
                          {catData.map((item, index) => (
                            <TableRow key={index} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                              {renderRows(item, cat.id, index)}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-gray-200 bg-gray-50">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900">"{keyword}"에 대한 검색 결과가 없습니다.</p>
            <p className="text-sm mt-2 text-gray-500">철자를 확인하거나 다른 검색어로 다시 시도해보세요.</p>
            <Link to="/" className="inline-block mt-6">
              <Button variant="outline" className="rounded-none border-gray-300">홈으로 돌아가기</Button>
            </Link>
          </div>
        )}
      </main>
      <Tail />
    </div>
  );
}

export default Search;
