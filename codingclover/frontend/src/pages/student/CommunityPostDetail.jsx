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
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

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

    const handleCreateComment = () => {
        if (!currentUser) {
            alert('로그인이 필요합니다.');
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

    if (!selectedPost) {
        return (
            <>
                <Nav />
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
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">커뮤니티 게시판</h1>

                    {/* 수정 화면 */}
                    {viewMode === 'edit' && (
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
                                <h2 className="text-2xl font-bold">게시글 수정</h2>
                            </div>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={postForm.title}
                                            onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={postForm.content}
                                            onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                    <div className="flex justify-center gap-3 pt-4">
                                        <Button
                                            onClick={handleUpdatePost}
                                            className="flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" />
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
                                    navigate('/student/community');
                                }}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                목록으로
                            </Button>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{selectedPost.title}
                                        {isNewPost(selectedPost.createdAt) && (
                                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1 text-[10px] font-bold leading-none text-white bg-red-400 rounded-full">
                                                N
                                            </span>
                                        )}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {selectedPost.authorName}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(selectedPost.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <div className="min-h-[200px] whitespace-pre-wrap text-foreground leading-relaxed">
                                        {selectedPost.content}
                                    </div>

                                    {/* 게시글 수정/삭제 권한 */}
                                    {(canEdit(selectedPost.authorLoginId, selectedPost.authorName) || canDelete(selectedPost.authorLoginId, selectedPost.authorName)) && (
                                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                            {canEdit(selectedPost.authorLoginId, selectedPost.authorName) && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setPostForm({ title: selectedPost.title, content: selectedPost.content });
                                                        setViewMode('edit');
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    수정
                                                </Button>
                                            )}
                                            {canDelete(selectedPost.authorLoginId, selectedPost.authorName) && (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDeletePost(selectedPost.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 댓글 섹션 */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5" />
                                            댓글 ({selectedPost.comments?.length || 0})
                                        </CardTitle>
                                        {currentUser && selectedPost.comments && selectedPost.comments.length > 0 && (
                                            <Button
                                                variant={myCommentsOnly ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setMyCommentsOnly(!myCommentsOnly);
                                                    setCurrentCommentPage(1); // 필터 변경 시 첫 페이지로 이동
                                                }}
                                                className="flex items-center gap-1"
                                            >
                                                <User className="h-3 w-3" />
                                                {myCommentsOnly ? '전체 댓글 보기' : '내가 쓴 댓글 보기'}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* 댓글 목록 */}
                                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                        <div className="space-y-4">
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
                                                            <div key={comment.id} className="border-b pb-4 last:border-b-0">
                                                                {editCommentId === comment.id ? (
                                                                    <div className="space-y-3">
                                                                        <Textarea
                                                                            value={editCommentContent}
                                                                            onChange={e => setEditCommentContent(e.target.value)}
                                                                            className="min-h-[80px]"
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleUpdateComment(comment.id)}
                                                                            >
                                                                                저장
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => setEditCommentId(null)}
                                                                            >
                                                                                취소
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="h-4 w-4" />
                                                                                <span className="font-medium">{comment.authorName}</span>
                                                                                {isNewComment(comment.createdAt) && (
                                                                                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1 text-[10px] font-bold leading-none text-white bg-red-400 rounded-full">
                                                                                        N
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm text-muted-foreground">
                                                                                    {new Date(comment.createdAt).toLocaleString()}
                                                                                </span>
                                                                                {(canEdit(comment.authorLoginId, comment.authorName) || canDelete(comment.authorLoginId, comment.authorName)) && (
                                                                                    <div className="flex gap-1">
                                                                                        {canEdit(comment.authorLoginId, comment.authorName) && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => {
                                                                                                    setEditCommentId(comment.id);
                                                                                                    setEditCommentContent(comment.content);
                                                                                                }}
                                                                                                className="h-6 px-2 text-xs"
                                                                                            >
                                                                                                <Edit className="h-3 w-3" />
                                                                                            </Button>
                                                                                        )}
                                                                                        {canDelete(comment.authorLoginId, comment.authorName) && (
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                                className="h-6 px-2 text-xs text-destructive"
                                                                                            >
                                                                                                <Trash2 className="h-3 w-3" />
                                                                                            </Button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        
                                                        {/* 댓글 페이징 */}
                                                        {totalCommentPages > 1 && (
                                                            <div className="flex justify-center items-center gap-2 pt-4">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setCurrentCommentPage(currentCommentPage - 1)}
                                                                    disabled={currentCommentPage === 1}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4" />
                                                                    이전
                                                                </Button>
                                                                
                                                                <div className="flex gap-1">
                                                                    {Array.from({ length: totalCommentPages }, (_, i) => i + 1).map(page => (
                                                                        <Button
                                                                            key={page}
                                                                            variant={currentCommentPage === page ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => setCurrentCommentPage(page)}
                                                                            className="w-8"
                                                                        >
                                                                            {page}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setCurrentCommentPage(currentCommentPage + 1)}
                                                                    disabled={currentCommentPage === totalCommentPages}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    다음
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                                        </div>
                                    )}

                                    <Separator className="my-4" />

                                    {/* 댓글 작성 */}
                                    {currentUser ? (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="댓글을 입력하세요..."
                                                value={commentContent}
                                                onChange={e => setCommentContent(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleCreateComment())}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleCreateComment}
                                                disabled={!commentContent.trim()}
                                                className="flex items-center gap-2"
                                            >
                                                <Send className="h-4 w-4" />
                                                등록
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 px-6 bg-muted/30 rounded-lg">
                                            <p className="text-muted-foreground mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => navigate('/auth/login')}
                                            >
                                                로그인
                                            </Button>
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