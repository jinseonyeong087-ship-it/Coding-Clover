import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, ChevronLeft, ChevronRight, EyeOff, Eye } from "lucide-react";

const CommunityPostDetail = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [viewMode, setViewMode] = useState('detail');
    const [selectedPost, setSelectedPost] = useState(null);
    const [postForm, setPostForm] = useState({ title: '', content: '' });
    const [commentContent, setCommentContent] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    // 댓글 페이징 상태
    const [currentCommentPage, setCurrentCommentPage] = useState(1);
    const [commentsPerPage] = useState(5);

    // 내가 쓴 댓글 필터 상태
    const [myCommentsOnly, setMyCommentsOnly] = useState(false);

    // 현재 로그인한 사용자의 정보를 저장
    const [currentUser, setCurrentUser] = useState(null);

    //게시글용(24시간)
    const isNewPost = (createdAt) => {
        if (!createdAt) return false;

        const now = Date.now();
        const created = new Date(createdAt).getTime();

        // 24시간 = 1000 * 60 * 60 * 24
        return now - created <= 1000 * 60 * 60 * 24;
    };

    //댓글용(24시간)
    const isNewComment = (createdAt) => {
        if (!createdAt) return false;

        const now = Date.now();
        const created = new Date(createdAt).getTime();

        // 24시간 = 1000 * 60 * 60 * 24
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        // URL 라우팅 처리 - useParams 사용
        const postId = params.postId;
        if (postId && !isNaN(postId)) {
            fetchPostDetail(parseInt(postId));
        }

        // [수정] 백엔드 UsersController의 @GetMapping("/auth/status")와 일치시킴
        axios.get('/auth/status', { withCredentials: true })
            .then(res => {
                if (res.data.loggedIn) {
                    // 백엔드에서 response.put("user", userData)로 보내주므로 res.data.user를 저장
                    setCurrentUser(res.data.user);
                    console.log("로그인 정보 확인됨:", res.data.user);
                }
            })
            .catch(err => console.error("사용자 정보 로드 실패:", err));
    }, [params.postId]);

    const fetchPostDetail = (id) => {
        axios.get(`/api/community/posts/${id}`, { withCredentials: true })
            .then(res => {
                setSelectedPost(res.data);
                setViewMode('detail');
            })
            .catch(err => {
                alert("게시글을 불러올 수 없습니다.");
                navigate('/student/community');
            });
    };

    // --- [중요] 권한 확인 헬퍼 함수 (백엔드 필드명 loginId 사용) ---
    const isOwner = (authorLoginId, authorName) => {
        if (!currentUser) return false;

        // 백엔드 UsersController에서 userData.put("loginId", user.getLoginId())로 보내줌
        const myLoginId = currentUser.loginId;
        const myName = currentUser.name;

        // ID(loginId) 또는 이름이 일치하는지 확인
        return (myLoginId && authorLoginId && myLoginId === authorLoginId) ||
            (myName && authorName && myName === authorName);
    };

    // 관리자 권한 체크 함수
    const isAdmin = () => {
        return currentUser && currentUser.role === 'ADMIN';
    };

    // 수정 권한 체크 (소유자만 가능)
    const canEdit = (authorLoginId, authorName) => {
        return isOwner(authorLoginId, authorName);
    };

    // 삭제 권한 체크 (소유자 또는 관리자)
    const canDelete = (authorLoginId, authorName) => {
        return isOwner(authorLoginId, authorName) || isAdmin();
    };

    const handleUpdatePost = () => {
        axios.put(`/api/community/posts/${selectedPost.id}/edit`, postForm, { withCredentials: true })
            .then(() => {
                alert("수정되었습니다.");
                setSelectedPost({ ...selectedPost, ...postForm });
                setViewMode('detail');
            })
            .catch(err => alert("수정 실패: " + (err.response?.data || err.message)));
    };

    const handleDeletePost = (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        axios.delete(`/api/community/posts/${id}/delete`, { withCredentials: true })
            .then(() => {
                alert("삭제되었습니다.");
                navigate('/student/community');
            })
            .catch(err => alert("삭제 실패: " + (err.response?.data || err.message)));
    };

    const handleTogglePostVisibility = () => {
        const isHidden = selectedPost.status === 'HIDDEN';
        const endpoint = isHidden
            ? `/api/community/posts/${selectedPost.id}/unhide`
            : `/api/community/posts/${selectedPost.id}/hide`;
        axios.put(endpoint, {}, { withCredentials: true })
            .then(() => fetchPostDetail(selectedPost.id))
            .catch(err => alert("상태 변경 실패: " + (err.response?.data || err.message)));
    };

    const handleCreateComment = () => {
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (currentUser.role === 'ADMIN') {
            alert('관리자는 댓글을 작성할 수 없습니다.');
            return;
        }
        if (!commentContent) return alert("내용을 입력하세요.");
        axios.post(`/api/community/posts/${selectedPost.id}/comments`, { content: commentContent }, { withCredentials: true })
            .then(() => {
                setCommentContent('');
                setCurrentCommentPage(1); // 새 댓글 작성 후 첫 페이지로 이동
                fetchPostDetail(selectedPost.id);
            })
            .catch(err => alert("댓글 등록 실패: " + err.response?.data));
    };

    const handleUpdateComment = (commentId) => {
        axios.put(`/api/community/comments/${commentId}`, { content: editCommentContent }, { withCredentials: true })
            .then(() => { setEditCommentId(null); fetchPostDetail(selectedPost.id); })
            .catch(err => alert("댓글 수정 실패: " + err.response?.data));
    };

    const handleDeleteComment = (commentId) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        axios.delete(`/api/community/comments/${commentId}`, { withCredentials: true })
            .then(() => fetchPostDetail(selectedPost.id))
            .catch(err => alert("댓글 삭제 실패: " + err.response?.data));
    };

    const handleToggleCommentVisibility = (commentId, status) => {
        const isHidden = status === 'HIDDEN';
        const endpoint = isHidden
            ? `/api/community/comments/${commentId}/unhide`
            : `/api/community/comments/${commentId}/hide`;
        axios.put(endpoint, {}, { withCredentials: true })
            .then(() => fetchPostDetail(selectedPost.id))
            .catch(err => alert("댓글 상태 변경 실패: " + (err.response?.data || err.message)));
    };

    if (!selectedPost) {
        return (
            <>
                <Nav />
                <div className='py-8' />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center py-8">
                            <p>게시글을 불러오는 중...</p>
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
            <div className='py-8' />
            <div className="container mx-auto px-4 py-12 relative">
                {/* Background Decoration */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto">
                    {/* 수정 화면 */}
                    {viewMode === 'edit' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('detail')}
                                    className="-ml-2 hover:bg-transparent hover:text-primary"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    취소하고 돌아가기
                                </Button>
                            </div>

                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg border-2">
                                <CardHeader>
                                    <CardTitle>게시글 수정</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-base font-semibold">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={postForm.title}
                                            onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                                            className="h-12 text-lg font-medium bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-base font-semibold">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={postForm.content}
                                            onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                            className="min-h-[400px] text-base leading-relaxed bg-background/50 resize-none p-4"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('detail')}
                                            className="w-24"
                                        >
                                            취소
                                        </Button>
                                        <Button
                                            onClick={handleUpdatePost}
                                            className="w-32 shadow-lg"
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
                        <div className="space-y-6">
                            {/* 자유게시판 헤더 */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block">자유게시판</h1>
                            </div>
                            
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    navigate('/student/community');
                                }}
                                className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                목록으로 돌아가기
                            </Button>

                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">자유게시판</Badge>
                                            {isNewPost(selectedPost.createdAt) && (
                                                <Badge className="h-4 w-4 rounded-full bg-red-500 border-none flex items-center justify-center p-0 text-[9px] font-bold">N</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-3xl font-bold leading-tight">{selectedPost.title}</CardTitle>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                                        {selectedPost.authorName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-foreground">{selectedPost.authorName}</span>
                                                </div>
                                                <Separator orientation="vertical" className="h-4" />
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(selectedPost.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* 게시글 수정/삭제 권한 */}
                                            {(canEdit(selectedPost.authorLoginId, selectedPost.authorName) || canDelete(selectedPost.authorLoginId, selectedPost.authorName) || isAdmin()) && (
                                                <div className="flex gap-2">
                                                    {canEdit(selectedPost.authorLoginId, selectedPost.authorName) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPostForm({ title: selectedPost.title, content: selectedPost.content });
                                                                setViewMode('edit');
                                                            }}
                                                            className="h-8 shadow-sm hover:bg-background"
                                                        >
                                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                                            수정
                                                        </Button>
                                                    )}
                                                    {canDelete(selectedPost.authorLoginId, selectedPost.authorName) && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeletePost(selectedPost.id)}
                                                            className="h-8 shadow-sm"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                            삭제
                                                        </Button>
                                                    )}
                                                    {isAdmin() && (
                                                        <Button
                                                            variant={selectedPost.status === 'HIDDEN' ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={handleTogglePostVisibility}
                                                            className="h-8 shadow-sm"
                                                        >
                                                            {selectedPost.status === 'HIDDEN' ? (
                                                                <>
                                                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                                                    복구
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                                                                    숨김
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 min-h-[300px]">
                                    <div className="whitespace-pre-wrap text-foreground leading-relaxed text-lg">
                                        {selectedPost.content}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 댓글 섹션 */}
                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg mt-8">
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <MessageCircle className="h-5 w-5 text-primary" />
                                            댓글 <span className="text-primary">{selectedPost.comments?.length || 0}</span>
                                        </CardTitle>
                                        {currentUser && currentUser.role !== 'ADMIN' && selectedPost.comments && selectedPost.comments.length > 0 && (
                                            <Button
                                                variant={myCommentsOnly ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => {
                                                    setMyCommentsOnly(!myCommentsOnly);
                                                    setCurrentCommentPage(1); // 필터 변경 시 첫 페이지로 이동
                                                }}
                                                className="h-8 text-xs"
                                            >
                                                <User className="h-3 w-3 mr-1" />
                                                {myCommentsOnly ? '전체 댓글 보기' : '내가 쓴 댓글 보기'}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* 댓글 목록 */}
                                    <div className="divide-y divide-border/50">
                                        {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                            <>
                                                {(() => {
                                                    // 댓글 필터링 및 페이징 로직
                                                    let comments = selectedPost.comments
                                                        .slice() // 원본 state 보호 (중요)
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 최신순

                                                    // 내가 쓴 댓글 필터링
                                                    if (myCommentsOnly && currentUser) {
                                                        comments = comments.filter(comment =>
                                                            comment.authorName === currentUser.name
                                                        );
                                                    }

                                                    const indexOfLastComment = currentCommentPage * commentsPerPage;
                                                    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
                                                    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
                                                    const totalCommentPages = Math.ceil(comments.length / commentsPerPage);

                                                    return (
                                                        <>
                                                            {currentComments.map(comment => (
                                                                <div key={comment.id} className="p-6 hover:bg-muted/10 transition-colors">
                                                                    {editCommentId === comment.id ? (
                                                                        <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/50">
                                                                            <Label className="text-xs font-semibold text-primary">댓글 수정 중</Label>
                                                                            <Textarea
                                                                                value={editCommentContent}
                                                                                onChange={e => setEditCommentContent(e.target.value)}
                                                                                className="min-h-[100px] bg-background"
                                                                            />
                                                                            <div className="flex justify-end gap-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => setEditCommentId(null)}
                                                                                >
                                                                                    취소
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleUpdateComment(comment.id)}
                                                                                >
                                                                                    저장
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                                                                                        {comment.authorName.charAt(0)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-semibold text-sm">{comment.authorName}</span>
                                                                                            {comment.status === 'HIDDEN' && (
                                                                                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">숨김</Badge>
                                                                                            )}
                                                                                            {isNewComment(comment.createdAt) && (
                                                                                                <Badge className="h-4 w-4 rounded-full bg-red-500 border-none flex items-center justify-center p-0 text-[9px] font-bold">N</Badge>
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="text-xs text-muted-foreground block mt-0.5">
                                                                                            {new Date(comment.createdAt).toLocaleString()}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                {(canEdit(comment.authorLoginId, comment.authorName) || canDelete(comment.authorLoginId, comment.authorName) || isAdmin()) && (
                                                                                    <div className="flex gap-1">
                                                                                        {canEdit(comment.authorLoginId, comment.authorName) && comment.status !== 'HIDDEN' && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => {
                                                                                                    setEditCommentId(comment.id);
                                                                                                    setEditCommentContent(comment.content);
                                                                                                }}
                                                                                                className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all"
                                                                                            >
                                                                                                <Edit className="h-3.5 w-3.5" />
                                                                                            </Button>
                                                                                        )}
                                                                                        {canDelete(comment.authorLoginId, comment.authorName) && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                                className="h-7 w-7 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
                                                                                            >
                                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                                            </Button>
                                                                                        )}
                                                                                        {isAdmin() && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => handleToggleCommentVisibility(comment.id, comment.status)}
                                                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                                                                                            >
                                                                                                {comment.status === 'HIDDEN' ? (
                                                                                                    <Eye className="h-3.5 w-3.5" />
                                                                                                ) : (
                                                                                                    <EyeOff className="h-3.5 w-3.5" />
                                                                                                )}
                                                                                            </Button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <p className={`text-sm pl-11 leading-relaxed whitespace-pre-wrap ${comment.status === 'HIDDEN' ? 'text-muted-foreground italic' : ''}`}>
                                                                                {comment.status === 'HIDDEN' ? '숨김 처리된 댓글입니다.' : comment.content}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* 댓글 페이징 */}
                                                            {totalCommentPages > 1 && (
                                                                <div className="flex justify-center items-center gap-2 p-4 border-t border-border/50">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setCurrentCommentPage(currentCommentPage - 1)}
                                                                        disabled={currentCommentPage === 1}
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4" />
                                                                    </Button>

                                                                    <div className="flex gap-1">
                                                                        {Array.from({ length: totalCommentPages }, (_, i) => i + 1).map(page => (
                                                                            <Button
                                                                                key={page}
                                                                                variant={currentCommentPage === page ? "default" : "ghost"}
                                                                                size="sm"
                                                                                onClick={() => setCurrentCommentPage(page)}
                                                                                className={`w-8 h-8 p-0 text-xs ${currentCommentPage === page ? 'shadow-sm' : ''}`}
                                                                            >
                                                                                {page}
                                                                            </Button>
                                                                        ))}
                                                                    </div>

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setCurrentCommentPage(currentCommentPage + 1)}
                                                                        disabled={currentCommentPage === totalCommentPages}
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground bg-muted/5">
                                                <p className="mb-2">아직 댓글이 없습니다.</p>
                                                <p className="text-sm">가장 먼저 댓글을 남겨보세요!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 댓글 작성 - 관리자가 아닐 때만 표시 */}
                                    {currentUser && currentUser.role !== 'ADMIN' && (
                                        <div className="p-6 bg-muted/30 border-t border-border/50">
                                            {currentUser ? (
                                                <div className="flex flex-col gap-3">
                                                    <Label className="text-sm font-semibold pl-1">새 댓글 작성</Label>
                                                    <div className="relative">
                                                        <Textarea
                                                            placeholder="따뜻한 댓글을 남겨주세요..."
                                                            value={commentContent}
                                                            onChange={e => setCommentContent(e.target.value)}
                                                            className="min-h-[80px] bg-background pr-12 resize-none"
                                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleCreateComment())}
                                                        />
                                                        <Button
                                                            onClick={handleCreateComment}
                                                            disabled={!commentContent.trim()}
                                                            size="icon"
                                                            className="absolute bottom-3 right-3 h-8 w-8 shadow-sm"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 px-6 bg-background/50 rounded-xl border border-dashed border-border/50">
                                                    <p className="text-muted-foreground mb-4 text-sm">댓글을 작성하려면 로그인이 필요합니다.</p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => navigate('/auth/login')}
                                                        className="shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                                                    >
                                                        로그인하러 가기
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

export default CommunityPostDetail;