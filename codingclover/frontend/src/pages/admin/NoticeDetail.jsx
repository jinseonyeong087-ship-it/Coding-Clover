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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Edit, Trash2, Eye, EyeOff } from "lucide-react";

const NoticeDetail = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('detail'); // 'detail', 'edit'
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', status: 'VISIBLE' });

    // 현재 로그인한 사용자의 정보를 저장
    const [currentUser, setCurrentUser] = useState(null);

    //게시글용(24시간)
    const isNewNotice = (createdAt) => {
        if (!createdAt) return false;

        const now = Date.now();
        const created = new Date(createdAt).getTime();

        // 24시간 = 1000 * 60 * 60 * 24
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        // URL 라우팅 처리 - useParams 사용
        const noticeId = params.noticeId;
        if (noticeId && !isNaN(noticeId)) {
            fetchNoticeDetail(parseInt(noticeId));
        }

        // 사용자 정보 가져오기
        axios.get('/auth/status', { withCredentials: true })
            .then(res => {
                if (res.data.loggedIn) {
                    setCurrentUser(res.data.user);
                    console.log("로그인 정보 확인됨:", res.data.user);
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

    // 관리자 권한 체크 함수
    const isAdmin = () => {
        return currentUser && currentUser.role === 'ADMIN';
    };

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
            <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
                <Nav />
                {/* Background Decoration */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 bg-muted rounded w-48 mb-4"></div>
                        <p className="text-muted-foreground">로딩 중...</p>
                    </div>
                </div>
                <Tail />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
            <Nav />
            {/* Background Decoration */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 py-24 flex-1">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">공지사항</h1>

                    {/* 수정 화면 */}
                    {viewMode === 'edit' && isAdmin() && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('detail')}
                                    className="flex items-center gap-2 hover:bg-background/50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    상세보기로
                                </Button>
                                <h2 className="text-2xl font-bold">공지사항 수정</h2>
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
                                            onClick={handleUpdateNotice}
                                            className="flex items-center gap-2 px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                                        >
                                            <Edit className="h-5 w-5" />
                                            수정 완료
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('detail')}
                                            className="px-8 py-6 text-lg bg-background/50"
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 상세 화면 */}
                    {viewMode === 'detail' && (
                        <div className="space-y-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigate('/notice');
                                }}
                                className="flex items-center gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                목록으로
                            </Button>

                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <CardHeader className="bg-muted/10 p-8 pb-6">
                                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                        <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-foreground/90">
                                            {selectedNotice.title}
                                            {isNewNotice(selectedNotice.createdAt) && (
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full shadow-sm">
                                                    N
                                                </span>
                                            )}
                                            {isAdmin() && (
                                                <Badge variant={selectedNotice.status === 'VISIBLE' ? 'default' : 'secondary'} className={selectedNotice.status === 'VISIBLE' ? "bg-green-500/15 text-green-600 border-green-200" : ""}>
                                                    {selectedNotice.status === 'VISIBLE' ? '공개' : '비공개'}
                                                </Badge>
                                            )}
                                        </CardTitle>

                                        {/* 관리자 버튼들 */}
                                        {isAdmin() && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={toggleNoticeStatus}
                                                    className="flex items-center gap-2"
                                                >
                                                    {selectedNotice.status === 'VISIBLE' ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4" />
                                                            비공개로 전환
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4" />
                                                            공개로 전환
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setNoticeForm({
                                                            title: selectedNotice.title,
                                                            content: selectedNotice.content,
                                                            status: selectedNotice.status
                                                        });
                                                        setViewMode('edit');
                                                    }}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    수정
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteNotice(selectedNotice.noticeId)}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-4">
                                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full">
                                            <User className="h-4 w-4" />
                                            <span className="font-medium text-foreground/80">{selectedNotice.authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(selectedNotice.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-6">
                                    <div className="min-h-[300px] whitespace-pre-wrap text-foreground/90 leading-loose text-lg">
                                        {selectedNotice.content}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            <Tail />
        </div>
    );
};

export default NoticeDetail;