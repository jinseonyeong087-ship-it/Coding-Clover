import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Send, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Eye, EyeOff, Plus, FileText } from "lucide-react";

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
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        fetchNotices();
        axios.get('/auth/status', { withCredentials: true })
            .then(res => {
                if (res.data.loggedIn) {
                    setCurrentUser(res.data.user);
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
                return titleMatch || contentMatch || authorMatch;
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
        setCurrentPage(1);
    }, [notices, searchTerm, sortOrder, currentUser]);

    const fetchNotices = () => {
        const url = currentUser && currentUser.role === 'ADMIN' ? '/admin/notice' : '/notice';
        axios.get(url, { withCredentials: true })
            .then(res => setNotices(res.data))
            .catch(err => {
                console.error("Failed to fetch notices", err);
                setNotices([]);
            });
    };

    const fetchNoticeDetail = (id) => {
        navigate(`/notice/detail/${id}`);
    };

    // 페이징 계산
    const indexOfLastNotice = currentPage * noticesPerPage;
    const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
    const currentNotices = filteredNotices.slice(indexOfFirstNotice, indexOfLastNotice);
    const totalPages = Math.ceil(filteredNotices.length / noticesPerPage);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleSortToggle = () => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');

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

    const openDetail = (id) => {
        navigate(`/notice/detail/${id}`);
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

    const isAdmin = () => currentUser && currentUser.role === 'ADMIN';

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Nav />
            {/* Header Section */}
            <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
                            공지사항
                        </h1>
                        <p className="text-lg text-gray-500">
                            Coding-Clover의 새로운 소식과 업데이트를 확인하세요.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* 1. 목록 화면 */}
                    {viewMode === 'list' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="제목 검색..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="pl-10 h-10 rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary w-full"
                                    />
                                </div>

                                {isAdmin() && (
                                    <Button
                                        onClick={() => {
                                            setNoticeForm({ title: '', content: '', status: 'VISIBLE' });
                                            setIsEditing(false);
                                            setEditingNotice(null);
                                            setViewMode('write');
                                        }}
                                        className="h-10 rounded-none bg-primary hover:bg-primary/90 text-white font-bold px-6"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        글쓰기
                                    </Button>
                                )}
                            </div>

                            <div className="border border-gray-200 bg-white">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-transparent border-b border-gray-200">
                                            <TableHead className="w-20 text-center font-bold text-gray-600">No</TableHead>
                                            <TableHead className="font-bold text-gray-600">제목</TableHead>
                                            <TableHead className="w-32 text-center font-bold text-gray-600">작성자</TableHead>
                                            <TableHead
                                                className="w-32 text-center cursor-pointer hover:text-primary transition-colors select-none font-bold text-gray-600"
                                                onClick={handleSortToggle}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    날짜
                                                    {sortOrder === 'newest' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                                                </div>
                                            </TableHead>
                                            {isAdmin() && <TableHead className="w-20 text-center font-bold text-gray-600">상태</TableHead>}
                                            {isAdmin() && <TableHead className="w-32 text-center font-bold text-gray-600">관리</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentNotices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={isAdmin() ? 6 : 4} className="text-center py-16 text-gray-500">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <FileText className="w-12 h-12 text-gray-300" />
                                                        <p>등록된 공지사항이 없습니다.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentNotices.map((notice, index) => (
                                                <TableRow
                                                    key={notice.noticeId}
                                                    className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                    onClick={() => openDetail(notice.noticeId)}
                                                >
                                                    <TableCell className="text-center font-medium text-gray-400">
                                                        {filteredNotices.length - (indexOfFirstNotice + index)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 py-1">
                                                            <span className="font-medium text-base text-gray-900 group-hover:text-primary line-clamp-1">{notice.title}</span>
                                                            {isNewNotice(notice.createdAt) && (
                                                                <Badge className="h-5 rounded-none bg-red-600 text-white border-none text-[10px] px-1.5 font-bold">NEW</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-medium text-gray-600">
                                                        {notice.authorName}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm text-gray-500">
                                                        {new Date(notice.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    {isAdmin() && (
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className={`rounded-none border px-2 py-0.5 ${notice.status === 'VISIBLE' ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500 bg-gray-50"}`}>
                                                                {notice.status === 'VISIBLE' ? '공개' : '비공개'}
                                                            </Badge>
                                                        </TableCell>
                                                    )}
                                                    {isAdmin() && (
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); toggleNoticeStatus(notice); }}>
                                                                    {notice.status === 'VISIBLE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); startEdit(notice); }}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(notice.noticeId); }}>
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
                            </div>

                            {/* 페이징 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="h-9 px-3 rounded-none border-gray-300"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={`h-9 w-9 rounded-none border ${currentPage === page ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            {page}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="h-9 px-3 rounded-none border-gray-300"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. 글쓰기/수정 화면 */}
                    {viewMode === 'write' && isAdmin() && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {isEditing ? '공지사항 수정' : '새 공지사항 작성'}
                                </h2>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setViewMode('list');
                                        setIsEditing(false);
                                        setEditingNotice(null);
                                    }}
                                    className="rounded-none border-gray-300"
                                >
                                    목록으로
                                </Button>
                            </div>

                            <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-bold text-gray-700">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={noticeForm.title}
                                            onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                            className="h-12 text-lg rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-sm font-bold text-gray-700">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={noticeForm.content}
                                            onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                            className="min-h-[400px] text-base leading-relaxed p-4 rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary resize-y font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">공개 상태</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={noticeForm.status === 'VISIBLE'}
                                                    onChange={() => setNoticeForm({ ...noticeForm, status: 'VISIBLE' })}
                                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium">공개</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={noticeForm.status === 'HIDDEN'}
                                                    onChange={() => setNoticeForm({ ...noticeForm, status: 'HIDDEN' })}
                                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium">비공개</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('list')}
                                            className="px-6 py-2.5 h-auto rounded-none border-gray-300 font-bold"
                                        >
                                            취소
                                        </Button>
                                        <Button
                                            onClick={isEditing ? handleUpdate : handleCreate}
                                            className="px-8 py-2.5 h-auto rounded-none bg-primary hover:bg-primary/90 text-white font-bold"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isEditing ? '수정 완료' : '등록하기'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            <Tail />
        </div>
    )
};
export default Notice;
