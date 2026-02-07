import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function TestSearch() {
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

    // 테이블 헤더 설정
    const renderHeader = (categoryId) => {
        switch (categoryId) {
            case 'COURSE':
                return (
                    <TableRow>
                        <TableHead className="text-center w-20">번호</TableHead>
                        <TableHead className="text-center">강좌명</TableHead>
                        <TableHead className="text-center">강사명</TableHead>
                    </TableRow>
                );
            case 'COMMUNITY':
            case 'QNA':
            case 'NOTICE':
                return (
                    <TableRow>
                        <TableHead className="text-center w-20">번호</TableHead>
                        <TableHead className="text-center">제목</TableHead>
                        <TableHead className="text-center w-40">작성자</TableHead>
                        <TableHead className="text-center w-40">작성일</TableHead>
                    </TableRow>
                );
            case 'STUDENT':
            case 'INSTRUCTOR':
                return (
                    <TableRow>
                        <TableHead className="text-center w-20">번호</TableHead>
                        <TableHead className="text-center">이름</TableHead>
                        <TableHead className="text-center">아이디</TableHead>
                        <TableHead className="text-center">이메일</TableHead>
                    </TableRow>
                );
            default:
                return (
                    <TableRow>
                        <TableHead className="text-center w-20">번호</TableHead>
                        <TableHead className="text-center">제목</TableHead>
                        <TableHead className="text-center">날짜</TableHead>
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
            case 'COURSE':
                return (
                    <>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="text-center font-medium text-blue-600">
                            <Link to={`/admin/course/${item.courseId}`} className="hover:underline">
                                {item.title}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center">{item.instructorName || "관리자"}</TableCell>
                    </>
                );
            case 'COMMUNITY':
            case 'QNA':
            case 'NOTICE':
                return (
                    <>
                        <TableCell className="text-center">{item.postId || item.qnaId || item.noticeId || item.id}</TableCell>
                        <TableCell className="text-center font-medium">
                            <Link to={linkPath} className="hover:underline">
                                {title}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {author}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">{dateStr}</TableCell>
                    </>
                );
            case 'STUDENT':
            case 'INSTRUCTOR':
                return (
                    <>
                        <TableCell className="text-center">{item.userId || item.id}</TableCell>
                        <TableCell className="text-center font-medium">{item.name}</TableCell>
                        <TableCell className="text-center">{item.loginId}</TableCell>
                        <TableCell className="text-center">{item.email}</TableCell>
                    </>
                );
            default: // CODING_TEST etc.
                return (
                    <>
                        <TableCell className="text-center">{item.id || item.problemId}</TableCell>
                        <TableCell className="text-center font-medium">
                            <Link to={`/coding-test/${item.id || item.problemId}`} className="hover:underline">
                                {item.title}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center text-gray-500">{dateStr}</TableCell>
                    </>
                );
        }
    };

    const [navHeight, setNavHeight] = useState(0);

    // 네비게이션 바 높이 동적 측정
    useEffect(() => {
        const updateNavHeight = () => {
            const navElement = document.querySelector('nav') || document.querySelector('header');
            if (navElement) {
                setNavHeight(navElement.offsetHeight);
            }
        };

        // 초기 측정 및 리사이즈 이벤트 등록
        updateNavHeight();
        // 이미지 로딩 등으로 높이가 변할 수 있으므로 잠시 후 한 번 더 체크
        setTimeout(updateNavHeight, 100);

        window.addEventListener('resize', updateNavHeight);
        return () => window.removeEventListener('resize', updateNavHeight);
    }, []);

    const hasAnyResults = Object.values(results).some(list => list && list.length > 0);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Nav />
            {/* 네비게이션 바 높이만큼 상단 여백을 동적으로 부여 (+ 여유 공간 40px) */}
            <main
                className="flex-1 container mx-auto px-16 pb-12"
                style={{ paddingTop: navHeight ? `${navHeight + 40}px` : '120px' }}
            >
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        <span className="text-blue-600">"{keyword}"</span> 검색 결과
                    </h2>
                    {loading && <p className="text-gray-500 mt-2">검색 중입니다...</p>}
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="h-40 animate-pulse bg-gray-100 border-none" />
                        ))}
                    </div>
                ) : hasAnyResults ? (
                    <div className="space-y-12">
                        {categories.map((cat) => {
                            const catData = results[cat.id] || [];
                            if (catData.length === 0) return null;

                            return (
                                <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center mb-4 ml-1">
                                        <h3 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
                                            {cat.name} <span className="text-blue-600 ml-1">({catData.length})</span>
                                        </h3>
                                    </div>
                                    <Card className="shadow-md border-none overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <Table>
                                            <TableHeader className="bg-gray-100/80">
                                                {renderHeader(cat.id)}
                                            </TableHeader>
                                            <TableBody className="bg-white">
                                                {catData.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-blue-50/30 transition-colors">
                                                        {renderRows(item, cat.id, index)}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
                        <p className="text-xl">"{keyword}"에 대한 검색 결과가 없습니다.</p>
                        <p className="text-sm mt-2 text-gray-400">다른 키워드로 검색해보세요.</p>
                    </div>
                )}
            </main>
            <Tail />
        </div>
    );
}

export default TestSearch;