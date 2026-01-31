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
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';
    const currentCategory = searchParams.get('category') || 'COURSE';

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 탭 메뉴 리스트
    const categories = [
        { id: 'COURSE', name: '강좌' },
        { id: 'LECTURE', name: '강의' },
        { id: 'INSTRUCTOR', name: '강사' },
        { id: 'STUDENT', name: '학생' },
        { id: 'CODING_TEST', name: '코딩테스트' },
        { id: 'COMMUNITY', name: '커뮤니티' },
        { id: 'QNA', name: 'Q&A' },
        { id: 'NOTICE', name: '공지사항' }, // 공지사항 추가
    ];

    useEffect(() => {
        if (keyword) {
            setLoading(true);
            const storedUsers = localStorage.getItem("users");
            const userRole = storedUsers ? JSON.parse(storedUsers).role : 'GUEST';

            axios.get('/api/search', {
                params: { category: currentCategory, keyword, role: userRole }
            })
                .then(res => {
                    console.log(`${currentCategory} 데이터 로드`, res.data);
                    setData(res.data.content || []);
                })
                .catch(err => console.error('검색 데이터 로딩 실패', err))
                .finally(() => setLoading(false));
        }
    }, [keyword, currentCategory]);

    const handleTabClick = (categoryId) => {
        setSearchParams({ category: categoryId, keyword });
    };

    // 테이블 헤더 설정
    const renderHeader = () => {
        switch (currentCategory) {
            case 'COURSE':
                return (
                    <TableRow>
                        <TableHead className="text-center w-20">번호</TableHead>
                        <TableHead className="text-center">강좌명</TableHead>
                        <TableHead className="text-center">강사명</TableHead>
                        <TableHead className="text-center">상태</TableHead>
                    </TableRow>
                );
            case 'COMMUNITY':
            case 'QNA':
            case 'NOTICE': // 공지사항도 제목/작성자/작성일 구조 사용
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
    const renderRows = (item) => {
        const dateStr = (item.regDate || item.createdAt)?.split('T')[0] || '-';

        switch (currentCategory) {
            case 'COURSE':
                return (
                    <>
                        <TableCell className="text-center">{item.courseId}</TableCell>
                        <TableCell className="text-center font-medium text-blue-600">
                            <Link to={`/admin/course/${item.courseId}`} className="hover:underline">
                                {item.title}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center">{item.instructorName || "관리자"}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={item.proposalStatus === 'APPROVED' ? 'secondary' : 'destructive'}>
                                {item.proposalStatus}
                            </Badge>
                        </TableCell>
                        // renderRows 내부의 제목/작성자 출력 부분 수정
                        <TableCell className="text-center font-medium">
                            <Link to={`/${currentCategory.toLowerCase()}/${item.postId || item.qnaId || item.noticeId || item.id}`} className="hover:underline">
                                {/* title이 없으면 subject를, 둘 다 없으면 '제목 없음' 출력 */}
                                {item.title || item.subject || "제목 없음"}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {/* 작성자 정보가 객체인지 문자열인지 모르므로 안전하게 접근 */}
                            {item.authorName || item.writer || item.user?.name || (currentCategory === 'NOTICE' ? '관리자' : '익명')}
                        </TableCell>
                    </>
                );
            case 'COMMUNITY':
            case 'QNA':
            case 'NOTICE':
                return (
                    <>
                        <TableCell className="text-center">{item.postId || item.qnaId || item.noticeId || item.id}</TableCell>
                        <TableCell className="text-center font-medium">
                            <Link to={`/${currentCategory.toLowerCase()}/${item.postId || item.qnaId || item.noticeId}`} className="hover:underline">
                                {item.title || item.subject}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {/* 공지사항은 보통 관리자가 작성하므로 분기 처리 */}
                            {currentCategory === 'NOTICE' ? (item.authorName || "관리자") : (item.authorName || item.writer || item.user?.name || "익명")}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">{dateStr}</TableCell>
                        // renderRows 내부의 제목/작성자 출력 부분 수정
                        <TableCell className="text-center font-medium">
                            <Link to={`/${currentCategory.toLowerCase()}/${item.postId || item.qnaId || item.noticeId || item.id}`} className="hover:underline">
                                {/* title이 없으면 subject를, 둘 다 없으면 '제목 없음' 출력 */}
                                {item.title || item.subject || "제목 없음"}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {/* 작성자 정보가 객체인지 문자열인지 모르므로 안전하게 접근 */}
                            {item.authorName || item.writer || item.user?.name || (currentCategory === 'NOTICE' ? '관리자' : '익명')}
                        </TableCell>
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
                        // renderRows 내부의 제목/작성자 출력 부분 수정
                        <TableCell className="text-center font-medium">
                            <Link to={`/${currentCategory.toLowerCase()}/${item.postId || item.qnaId || item.noticeId || item.id}`} className="hover:underline">
                                {/* title이 없으면 subject를, 둘 다 없으면 '제목 없음' 출력 */}
                                {item.title || item.subject || "제목 없음"}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {/* 작성자 정보가 객체인지 문자열인지 모르므로 안전하게 접근 */}
                            {item.authorName || item.writer || item.user?.name || (currentCategory === 'NOTICE' ? '관리자' : '익명')}
                        </TableCell>
                    </>
                );
            default:
                return (
                    <>
                        <TableCell className="text-center">{item.id || item.noticeId}</TableCell>
                        <TableCell className="text-center font-medium">{item.title || item.subject}</TableCell>
                        <TableCell className="text-center text-gray-500">{dateStr}</TableCell>
                        // renderRows 내부의 제목/작성자 출력 부분 수정
                        <TableCell className="text-center font-medium">
                            <Link to={`/${currentCategory.toLowerCase()}/${item.postId || item.qnaId || item.noticeId || item.id}`} className="hover:underline">
                                {/* title이 없으면 subject를, 둘 다 없으면 '제목 없음' 출력 */}
                                {item.title || item.subject || "제목 없음"}
                            </Link>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-700">
                            {/* 작성자 정보가 객체인지 문자열인지 모르므로 안전하게 접근 */}
                            {item.authorName || item.writer || item.user?.name || (currentCategory === 'NOTICE' ? '관리자' : '익명')}
                        </TableCell>
                    </>
                );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Nav />
            <main className="flex-1 container mx-auto px-16 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">
                        <span className="text-blue-600">"{keyword}"</span> 검색 결과
                    </h2>
                </div>

                {/* 카테고리 탭 영역 */}
                <div className="flex flex-wrap gap-1 mb-6 border-b bg-white rounded-t-lg shadow-sm">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleTabClick(cat.id)}
                            className={`px-6 py-3 text-sm font-bold transition-all relative ${currentCategory === cat.id
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <Card className="shadow-lg border-none overflow-hidden">
                    <Table>
                        <TableCaption className="caption-top text-left font-bold text-xl mb-4 px-6 pt-4 text-gray-800">
                            {categories.find(c => c.id === currentCategory)?.name} 검색 리스트
                        </TableCaption>
                        <TableHeader className="bg-gray-100">
                            {renderHeader()}
                        </TableHeader>
                        <TableBody className="bg-white">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-blue-600 font-bold">
                                        데이터를 검색 중입니다...
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-blue-50/30 transition-colors">
                                        {renderRows(item)}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-gray-400">
                                        "{keyword}"에 대한 검색 결과가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </main>
            <Tail />
        </div>
    );
}

export default TestSearch;