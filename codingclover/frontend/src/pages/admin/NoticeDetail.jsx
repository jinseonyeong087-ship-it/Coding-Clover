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
            <>
                <Nav />
                <div className='py-8'/>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-8">
                            <p>로딩 중...</p>
                        </div>
                    </div>
                </div>
                <Tail />
            </>
        );
    }

    return (
        <>
            <Nav />
            <div className='py-8'/>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">공지사항</h1>

                    {/* 수정 화면 */}
                    {viewMode === 'edit' && isAdmin() && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewMode('detail')}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    상세보기로
                                </Button>
                                <h2 className="text-2xl font-bold">공지사항 수정</h2>
                            </div>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={noticeForm.title}
                                            onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={noticeForm.content}
                                            onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">공개 상태</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={noticeForm.status === 'VISIBLE' ? 'default' : 'outline'}
                                                onClick={() => setNoticeForm({ ...noticeForm, status: 'VISIBLE' })}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                공개
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={noticeForm.status === 'HIDDEN' ? 'default' : 'outline'}
                                                onClick={() => setNoticeForm({ ...noticeForm, status: 'HIDDEN' })}
                                                className="flex items-center gap-2"
                                            >
                                                <EyeOff className="h-4 w-4" />
                                                비공개
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-3 pt-4">
                                        <Button
                                            onClick={handleUpdateNotice}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            수정 완료
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('detail')}
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
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                목록으로
                            </Button>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-4">
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            {selectedNotice.title}
                                            {isNewNotice(selectedNotice.createdAt) && (
                                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1 text-[10px] font-bold leading-none text-white bg-red-400 rounded-full">
                                                    N
                                                </span>
                                            )}
                                            {isAdmin() && (
                                                <Badge variant={selectedNotice.status === 'VISIBLE' ? 'default' : 'secondary'}>
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
                                                            비공개
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4" />
                                                            공개
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
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    수정
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteNotice(selectedNotice.noticeId)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {selectedNotice.authorName}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(selectedNotice.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <div className="min-h-[200px] whitespace-pre-wrap text-foreground leading-relaxed">
                                        {selectedNotice.content}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            <Tail />
        </>
    );
};

export default NoticeDetail;