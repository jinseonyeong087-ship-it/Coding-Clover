import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft } from "lucide-react";

const CommunityPost = () => {
    const [viewMode, setViewMode] = useState('list');
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [postForm, setPostForm] = useState({ title: '', content: '' });
    const [commentContent, setCommentContent] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    
    // 현재 로그인한 사용자의 정보를 저장
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchPosts();
        
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
    }, []);

    const fetchPosts = () => {
        axios.get('/api/community/posts', { withCredentials: true })
            .then(res => setPosts(res.data))
            .catch(err => console.error(err));
    };

    const fetchPostDetail = (id) => {
        axios.get(`/api/community/posts/${id}`, { withCredentials: true })
            .then(res => {
                setSelectedPost(res.data);
                setViewMode('detail');
                window.history.pushState({ postId: id }, '', `/student/community/posts/${id}`);
            })
            .catch(err => alert("게시글을 불러올 수 없습니다."));
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

    // --- 핸들러 함수들 ---
    const handleCreatePost = () => {
        if (!postForm.title || !postForm.content) return alert("입력값을 확인하세요.");
        axios.post('/api/community/posts/new', postForm, { withCredentials: true })
            .then(() => { alert("등록되었습니다."); setPostForm({ title: '', content: '' }); setViewMode('list'); fetchPosts(); })
            .catch(err => alert("등록 실패: " + (err.response?.data || err.message)));
    };

    const handleUpdatePost = () => {
        axios.put(`/api/community/posts/${selectedPost.id}/edit`, postForm, { withCredentials: true })
            .then(() => { alert("수정되었습니다."); setSelectedPost({ ...selectedPost, ...postForm }); setViewMode('detail'); })
            .catch(err => alert("수정 실패: " + (err.response?.data || err.message)));
    };

    const handleDeletePost = (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        axios.delete(`/api/community/posts/${id}/delete`, { withCredentials: true })
            .then(() => { alert("삭제되었습니다."); setViewMode('list'); fetchPosts(); })
            .catch(err => alert("삭제 실패: " + (err.response?.data || err.message)));
    };

    const handleCreateComment = () => {
        if (!commentContent) return alert("내용을 입력하세요.");
        axios.post(`/api/community/posts/${selectedPost.id}/comments`, { content: commentContent }, { withCredentials: true })
            .then(() => { setCommentContent(''); fetchPostDetail(selectedPost.id); })
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

    return (
        <>
            <Nav />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">커뮤니티 게시판</h1>

                    {/* 1. 목록 화면 */}
                    {viewMode === 'list' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6" />
                                    <span className="text-lg font-semibold">자유게시판</span>
                                </div>
                                <Button 
                                    onClick={() => { setPostForm({ title: '', content: '' }); setViewMode('write'); }}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    글쓰기
                                </Button>
                            </div>
                            
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {posts.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
                                            </div>
                                        ) : (
                                            posts.map(post => (
                                                <div 
                                                    key={post.id} 
                                                    onClick={() => fetchPostDetail(post.id)} 
                                                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-medium mb-1">{post.title}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <User className="h-3 w-3" />
                                                                    {post.authorName}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">#{post.id}</Badge>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 2. 글쓰기/수정 화면 */}
                    {(viewMode === 'write' || viewMode === 'edit') && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setViewMode(viewMode === 'edit' ? 'detail' : 'list')}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {viewMode === 'edit' ? '상세보기로' : '목록으로'}
                                </Button>
                                <h2 className="text-2xl font-bold">
                                    {viewMode === 'write' ? '새 게시글 작성' : '게시글 수정'}
                                </h2>
                            </div>
                            
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">제목</Label>
                                        <Input
                                            id="title"
                                            placeholder="제목을 입력하세요"
                                            value={postForm.title}
                                            onChange={e => setPostForm({...postForm, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">내용</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="내용을 입력하세요"
                                            value={postForm.content}
                                            onChange={e => setPostForm({...postForm, content: e.target.value})}
                                            className="min-h-[200px]"
                                        />
                                    </div>
                                    <div className="flex justify-center gap-3 pt-4">
                                        <Button 
                                            onClick={viewMode === 'write' ? handleCreatePost : handleUpdatePost}
                                            className="flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            {viewMode === 'write' ? '등록' : '수정 완료'}
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => setViewMode(viewMode === 'edit' ? 'detail' : 'list')}
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 4. 상세 화면 */}
                    {viewMode === 'detail' && selectedPost && (
                        <div className="space-y-6">
                            <Button 
                                variant="outline" 
                                onClick={() => { 
                                    setViewMode('list'); 
                                    setSelectedPost(null); 
                                    fetchPosts(); 
                                    window.history.pushState(null, '', '/student/community'); 
                                }}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                목록으로
                            </Button>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {selectedPost.authorName}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(selectedPost.createdAt).toLocaleString()}
                                        </div>
                                        <Badge variant="outline">#{selectedPost.id}</Badge>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-6">
                                    <div className="min-h-[200px] whitespace-pre-wrap text-foreground leading-relaxed">
                                        {selectedPost.content}
                                    </div>
                                    
                                    {/* 게시글 작성자만 수정/삭제 가능 */}
                                    {isOwner(selectedPost.authorLoginId, selectedPost.authorName) && (
                                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
                                            <Button 
                                                variant="destructive"
                                                onClick={() => handleDeletePost(selectedPost.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                삭제
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 댓글 섹션 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        댓글 ({selectedPost.comments?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* 댓글 목록 */}
                                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedPost.comments.map(comment => (
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
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(comment.createdAt).toLocaleString()}
                                                                    </span>
                                                                    {isOwner(comment.authorLoginId, comment.authorName) && (
                                                                        <div className="flex gap-1">
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
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                className="h-6 px-2 text-xs text-destructive"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                                        </div>
                                    )}
                                    
                                    <Separator className="my-4" />
                                    
                                    {/* 댓글 작성 */}
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

export default CommunityPost;