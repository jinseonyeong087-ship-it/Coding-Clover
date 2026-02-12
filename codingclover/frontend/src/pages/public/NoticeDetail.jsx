import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Edit, Trash2, Eye, EyeOff, Send } from "lucide-react";

const NoticeDetail = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('detail'); // 'detail', 'edit'
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', status: 'VISIBLE' });
    const [currentUser, setCurrentUser] = useState(null);

    const isNewNotice = (createdAt) => {
        if (!createdAt) return false;
        const now = Date.now();
        const created = new Date(createdAt).getTime();
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        const noticeId = params.noticeId;
        if (noticeId && !isNaN(noticeId)) {
            fetchNoticeDetail(parseInt(noticeId));
        }

        axios.get('/auth/status', { withCredentials: true })
            .then(res => {
                if (res.data.loggedIn) {
                    setCurrentUser(res.data.user);
                }
            })
            .catch(err => console.error("사용자 정보 로드 실패:", err));
    }, [params.noticeId]);

    const fetchNoticeDetail = (id) => {
        axios.get(`/notice/${id}`, { withCredentials: true })
            .then(res => {
                setSelectedNotice(res.data);
                setViewMode('detail');
            })
            .catch(err => {
                alert("공지사항을 불러올 수 없습니다.");
                navigate('/notice');
            });
    };

    const isAdmin = () => currentUser && currentUser.role === 'ADMIN';

    const handleUpdateNotice = () => {
        const formData = {
            title: noticeForm.title,
            content: noticeForm.content,
            status: noticeForm.status
        };

        axios.put(`/admin/notice/${selectedNotice.noticeId}`, formData, { withCredentials: true })
            .then(() => {
                alert("수정되었습니다.");
                setSelectedNotice({ ...selectedNotice, ...formData });
                setViewMode('detail');
            })
            .catch(err => alert("수정 실패: " + (err.response?.data || err.message)));
    };

    const handleDeleteNotice = (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        axios.delete(`/admin/notice/${id}`, { withCredentials: true })
            .then(() => {
                alert("삭제되었습니다.");
                navigate('/notice');
            })
            .catch(err => alert("삭제 실패: " + (err.response?.data || err.message)));
    };

    const toggleNoticeStatus = () => {
        if (!selectedNotice) return;

        const newStatus = selectedNotice.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
        const formData = {
            title: selectedNotice.title,
            content: selectedNotice.content,
            status: newStatus
        };

        axios.put(`/admin/notice/${selectedNotice.noticeId}`, formData, { withCredentials: true })
            .then(() => {
                alert(`공지사항이 ${newStatus === 'VISIBLE' ? '공개' : '비공개'}로 변경되었습니다.`);
                setSelectedNotice({ ...selectedNotice, status: newStatus });
            })
            .catch(err => alert("상태 변경 실패: " + (err.response?.data || err.message)));
    };

    if (!selectedNotice) {
        return (
            <div className="flex min-h-screen flex-col bg-white">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                        <p className="text-gray-500">로딩 중...</p>
                    </div>
                </div>
                <Tail />
            </div>
        );
    }

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
                            상세 내용을 확인하세요.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* 수정 화면 */}
                    {viewMode === 'edit' && isAdmin() && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    공지사항 수정
                                </h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('detail')}
                                    className="rounded-none border-gray-300"
                                >
                                    취소
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
                                            onClick={() => setViewMode('detail')}
                                            className="px-6 py-2.5 h-auto rounded-none border-gray-300 font-bold"
                                        >
                                            취소
                                        </Button>
                                        <Button
                                            onClick={handleUpdateNotice}
                                            className="px-8 py-2.5 h-auto rounded-none bg-primary hover:bg-primary/90 text-white font-bold"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            수정 완료
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 상세 화면 */}
                    {viewMode === 'detail' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/notice')}
                                    className="flex items-center gap-2 -ml-3 text-gray-500 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    목록으로 돌아가기
                                </Button>
                            </div>

                            <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-8 px-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-white rounded-none border-gray-300 text-gray-600 font-medium">공지사항</Badge>
                                            {isNewNotice(selectedNotice.createdAt) && (
                                                <Badge className="h-5 bg-red-600 rounded-none border-none text-[10px] px-1.5 font-bold text-white">NEW</Badge>
                                            )}
                                            {isAdmin() && (
                                                <Badge variant={selectedNotice.status === 'VISIBLE' ? 'default' : 'secondary'} className={`rounded-none border px-2 py-0.5 ${selectedNotice.status === 'VISIBLE' ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                                    {selectedNotice.status === 'VISIBLE' ? '공개' : '비공개'}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-3xl font-bold leading-tight text-gray-900">{selectedNotice.title}</CardTitle>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 pt-2 gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-700">{selectedNotice.authorName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(selectedNotice.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {isAdmin() && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={toggleNoticeStatus}
                                                        className="h-8 rounded-none text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                    >
                                                        {selectedNotice.status === 'VISIBLE' ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                                        <span className="text-xs">{selectedNotice.status === 'VISIBLE' ? '숨기기' : '공개'}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setNoticeForm({
                                                                title: selectedNotice.title,
                                                                content: selectedNotice.content,
                                                                status: selectedNotice.status
                                                            });
                                                            setViewMode('edit');
                                                        }}
                                                        className="h-8 rounded-none text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">수정</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteNotice(selectedNotice.noticeId)}
                                                        className="h-8 rounded-none text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">삭제</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 py-10 min-h-[300px]">
                                    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {selectedNotice.content}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            <Tail />
        </div>
    );
};

export default NoticeDetail;