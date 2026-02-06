import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

const Notice = () => {
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('list');
    const [notices, setNotices] = useState([]);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', status: 'VISIBLE' });

    // 검색 및 페이징 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [noticesPerPage] = useState(15);

    // 정렬 상태
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' 또는 'oldest'

    // 현재 로그인한 사용자의 정보를 저장
    const [currentUser, setCurrentUser] = useState(null);

    // 수정 모드 관련
    const [isEditing, setIsEditing] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);

    //게시글용(24시간)
    const isNewNotice = (createdAt) => {
        if (!createdAt) return false;

        const now = Date.now();
        const created = new Date(createdAt).getTime();

        // 24시간 = 1000 * 60 * 60 * 24
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        fetchNotices();

        // 사용자 정보 가져오기
        axios.get('/auth/status', { withCredentials: true })
            .then(res => {
                if (res.data.loggedIn) {
                    setCurrentUser(res.data.user);
                    console.log("로그인 정보 확인됨:", res.data.user);
                }
            })
            .catch(err => console.error("사용자 정보 로드 실패:", err));
    }, []);

    // 검색 및 필터링
    useEffect(() => {
        let filtered = [...notices];

        // 검색 필터링
        if (searchTerm) {
            const normalizedSearchTerm = searchTerm.trim().toLowerCase();

            filtered = filtered.filter(notice => {
                const titleMatch = notice.title.toLowerCase().includes(normalizedSearchTerm);
                const contentMatch = notice.content.toLowerCase().includes(normalizedSearchTerm);
                const authorMatch = notice.authorName.toLowerCase().includes(normalizedSearchTerm);

                // 영어/숫자 검색 향상을 위한 추가 검색
                const titleMatchNormal = notice.title.includes(searchTerm);
                const contentMatchNormal = notice.content.includes(searchTerm);
                const authorMatchNormal = notice.authorName.includes(searchTerm);

                return titleMatch || contentMatch || authorMatch ||
                    titleMatchNormal || contentMatchNormal || authorMatchNormal;
            });
        }

        // 관리자가 아닌 경우 VISIBLE 상태만 보여줌
        if (currentUser && currentUser.role !== 'ADMIN') {
            filtered = filtered.filter(notice => notice.status === 'VISIBLE');
        }

        // 정렬 적용
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredNotices(filtered);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    }, [notices, searchTerm, sortOrder, currentUser]);

    const fetchNotices = () => {
        // 관리자인 경우 모든 공지사항을, 일반 사용자는 공개된 공지사항만
        const url = currentUser && currentUser.role === 'ADMIN' ? '/admin/notice' : '/notice';
        axios.get(url, { withCredentials: true })
            .then(res => setNotices(res.data))
            .catch(err => {
                console.error("Failed to fetch notices", err);
                const errMsg = err.response?.data?.message || err.response?.data || err.message;
                setNotices([]); // Reset to empty on error
                alert(`데이터 불러오기 실패: ${errMsg}\n\n* 중요: 백엔드 코드가 수정되었습니다. 백엔드 서버를 반드시 재시작해주세요.`);
            });
    };

    const fetchNoticeDetail = (id) => {
        navigate(`/notice/detail/${id}`);
    };

    // --- 핸들러 함수들 ---

    // 페이징 계산
    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = filteredNotices.slice(indexOfFirstNotice, indexOfLastNotice);
    const totalPages = Math.ceil(filteredNotices.length / noticesPerPage);

    // 검색 핸들러
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 정렬 핸들러
    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const handleCreate = async () => {
        try {
            await axios.post('/admin/notice', noticeForm);
            alert("공지사항 등록 성공");
            setNoticeForm({ title: '', content: '', status: 'VISIBLE' });
            setViewMode('list');
            fetchNotices();
        } catch (err) {
            alert("등록 실패: " + err.message);
        }
    };

    const handleUpdate = async () => {
        if (!editingNotice) return;
        try {
            await axios.put(`/admin/notice/${editingNotice.noticeId}`, noticeForm);
            alert("수정 성공");
            setIsEditing(false);
            setEditingNotice(null);
            setViewMode('list');
            fetchNotices();
        } catch (err) {
            alert("수정 실패: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/admin/notice/${id}`);
            alert("삭제 성공");
            fetchNotices();
        } catch (err) {
            alert("삭제 실패: " + err.message);
        }
    };

    const openDetail = async (id) => {
        try {
            const res = await axios.get(`/notice/${id}`);
            // 상세 페이지로 이동
            navigate(`/notice/detail/${id}`);
        } catch (err) {
            alert("상세 조회 실패: " + err.message);
        }
    };

    const startEdit = (notice) => {
        setEditingNotice(notice);
        setNoticeForm({
            title: notice.title,
            content: notice.content,
            status: notice.status || 'VISIBLE'
        });
        setIsEditing(true);
        setViewMode('write');
    };

    const toggleNoticeStatus = (notice) => {
        const newStatus = notice.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
        const formData = {
            title: notice.title,
            content: notice.content,
            status: newStatus
        };

        axios.put(`/admin/notice/${notice.noticeId}`, formData, { withCredentials: true })
            .then(() => {
                alert(`공지사항이 ${newStatus === 'VISIBLE' ? '공개' : '비공개'}로 변경되었습니다.`);
                fetchNotices();
            })
            .catch(err => alert("상태 변경 실패: " + (err.response?.data || err.message)));
    };

    // 관리자 권한 체크
    const isAdmin = () => {
        return currentUser && currentUser.role === 'ADMIN';
    };

    return (
        <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
            <Nav />
            <div className='py-8' />
            <div className="container mx-auto px-4 py-12 flex-1 relative">
                {/* Background Decoration */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block">공지사항</h1>
                        <p className="text-muted-foreground text-lg">중요한 소식과 업데이트를 확인하세요.</p>
                    </div>

                    {/* 1. 목록 화면 */}
                    {viewMode === 'list' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-bold">
                                        총 <span className="text-primary">{filteredNotices.length}</span>개
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isAdmin() && (
                                        <Button
                                            onClick={() => {
                                                setNoticeForm({ title: '', content: '', status: 'VISIBLE' });
                                                setIsEditing(false);
                                                setEditingNotice(null);
                                                setViewMode('write');
                                            }}
                                            className="flex items-center gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                        >
                                            <Edit className="h-4 w-4" />
                                            글쓰기
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* 검색 */}
                            <div className="flex items-center gap-2 max-w-md bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-border/50 focus-within:ring-2 ring-primary/20 transition-all">
                                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                                <Input
                                    placeholder="제목, 내용 검색"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
                                />
                            </div>

                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-20 text-center font-semibold">번호</TableHead>
                                            <TableHead className="font-semibold">제목</TableHead>
                                            <TableHead className="w-32 text-center font-semibold">작성자</TableHead>
                                            <TableHead
                                                className="w-40 text-center cursor-pointer hover:text-primary transition-colors select-none font-semibold"
                                                onClick={handleSortToggle}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    등록일
                                                    {sortOrder === 'newest' ?
                                                        <ChevronDown className="h-3 w-3" /> :
                                                        <ChevronUp className="h-3 w-3" />
                                                    }
                                                </div>
                                            </TableHead>
                                            {isAdmin() && <TableHead className="w-20 text-center font-semibold">상태</TableHead>}
                                            {isAdmin() && <TableHead className="w-32 text-center font-semibold">관리</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentNotices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={isAdmin() ? 6 : 4} className="text-center py-12 text-muted-foreground">
                                                    등록된 공지사항이 없습니다.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentNotices.map((notice, index) => (
                                                <TableRow
                                                    key={notice.noticeId}
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                                    onClick={() => openDetail(notice.noticeId)}
                                                >
                                                    <TableCell className="text-center font-medium text-muted-foreground group-hover:text-foreground">
                                                        {filteredNotices.length - (indexOfFirstNotice + index)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 py-1">
                                                            <span className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">{notice.title}</span>
                                                            {isNewNotice(notice.createdAt) && (
                                                                <Badge className="h-4 w-4 rounded-full bg-red-500 border-none flex items-center justify-center p-0 text-[9px] font-bold">N</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                {notice.authorName.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium">{notice.authorName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm text-muted-foreground">
                                                        {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit'
                                                        })}
                                                    </TableCell>
                                                    {isAdmin() && (
                                                        <TableCell className="text-center">
                                                            <Badge variant={notice.status === 'VISIBLE' ? 'default' : 'secondary'} className={notice.status === 'VISIBLE' ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200" : ""}>
                                                                {notice.status === 'VISIBLE' ? '공개' : '비공개'}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {isAdmin() && (
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleNoticeStatus(notice);
                                                                    }}
                                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                                    title={notice.status === 'VISIBLE' ? '비공개' : '공개'}
                                                                >
                                                                    {notice.status === 'VISIBLE' ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEdit(notice);
                                                                    }}
                                                                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                    title="수정"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(notice.noticeId);
                                                                    }}
                                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    title="삭제"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* 페이징 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 bg-background/50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        이전
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className={`w-8 ${currentPage === page ? "bg-primary text-primary-foreground shadow-md" : "bg-background/50"}`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 bg-background/50"
                                    >
                                        다음
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. 글쓰기/수정 화면 (관리자만) */}
                    {viewMode === 'write' && isAdmin() && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setViewMode('list');
                                        setIsEditing(false);
                                        setEditingNotice(null);
                                    }}
                                    className="flex items-center gap-2 hover:bg-background/50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    목록으로
                                </Button>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    {isEditing ? '공지사항 수정' : '새 공지사항 작성'}
                                </h2>
                            </div>

                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="title" className="text-lg">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={noticeForm.title}
                                            onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                            className="text-lg py-6 bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="content" className="text-lg">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={noticeForm.content}
                                            onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                            className="min-h-[400px] text-base leading-relaxed p-4 bg-background/50 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="status">공개 상태</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={noticeForm.status === 'VISIBLE' ? 'default' : 'outline'}
                                                onClick={() => setNoticeForm({ ...noticeForm, status: 'VISIBLE' })}
                                                className={`flex items-center gap-2 ${noticeForm.status === 'VISIBLE' ? "bg-green-600 hover:bg-green-700" : ""}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                공개
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={noticeForm.status === 'HIDDEN' ? 'default' : 'outline'}
                                                onClick={() => setNoticeForm({ ...noticeForm, status: 'HIDDEN' })}
                                                className={`flex items-center gap-2 ${noticeForm.status === 'HIDDEN' ? "bg-gray-600 hover:bg-gray-700" : ""}`}
                                            >
                                                <EyeOff className="h-4 w-4" />
                                                비공개
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-3 pt-8">
                                        <Button
                                            onClick={isEditing ? handleUpdate : handleCreate}
                                            className="flex items-center gap-2 px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                                        >
                                            <Send className="h-5 w-5" />
                                            {isEditing ? '수정 완료' : '등록하기'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('list')}
                                            className="px-8 py-6 text-lg bg-background/50"
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            <Tail />
        </div>
    )
};
export default Notice;
