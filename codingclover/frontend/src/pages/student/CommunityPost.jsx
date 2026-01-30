import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";

const CommunityPost = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    const [viewMode, setViewMode] = useState('list');
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [postForm, setPostForm] = useState({ title: '', content: '' });
    const [commentContent, setCommentContent] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    
    // 검색 및 페이징 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);

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
        fetchPosts();

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
    }, [location]);
    
    // 검색 및 필터링
    useEffect(() => {
        let filtered = [...posts];
        
        // 검색 필터링
        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // 최신 순으로 정렬 (ID 기준 내림차순)
        filtered.sort((a, b) => b.id - a.id);
        
        setFilteredPosts(filtered);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    }, [posts, searchTerm]);

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
                navigate(`/student/community/posts/${id}`);
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
    
    // 페이징 계산
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    // 검색 핸들러
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const handleCreatePost = () => {
        if (!postForm.title || !postForm.content) return alert("입력값을 확인하세요.");
        axios.post('/api/community/posts/new', postForm, { withCredentials: true })
            .then(() => { 
                alert("등록되었습니다."); 
                setPostForm({ title: '', content: '' }); 
                setViewMode('list'); 
                navigate('/student/community');
                fetchPosts(); 
            })
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
            .then(() => { 
                alert("삭제되었습니다."); 
                setViewMode('list'); 
                navigate('/student/community');
                fetchPosts(); 
            })
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
                                    <Badge variant="outline">{filteredPosts.length}개</Badge>
                                </div>
                                <Button
                                    onClick={() => { setPostForm({ title: '', content: '' }); setViewMode('write'); }}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    글쓰기
                                </Button>
                            </div>
                            
                            {/* 검색 */}
                            <div className="flex items-center gap-2 max-w-md">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="제목, 내용, 작성자 검색..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="flex-1"
                                />
                            </div>
                            
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16 text-center">번호</TableHead>
                                            <TableHead>제목</TableHead>
                                            <TableHead className="w-24 text-center">작성자</TableHead>
                                            <TableHead className="w-32 text-center">작성일</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPosts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                    {searchTerm ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentPosts.map((post, index) => {
                                                // 전체 게시글에서의 실제 번호 계산 (최신글이 1번)
                                                const postNumber = filteredPosts.length - (indexOfFirstPost + index);
                                                return (
                                                    <TableRow 
                                                        key={post.id} 
                                                        onClick={() => fetchPostDetail(post.id)} 
                                                        className="cursor-pointer hover:bg-muted/50"
                                                    >
                                                        <TableCell className="text-center font-medium">
                                                            {postNumber}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{post.title}</span>
                                                                {post.comments && post.comments.length > 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ({post.comments.length})
                                                                    </span>
                                                                )}
                                                                {isNewPost(post.createdAt) && (
                                                                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1 text-[10px] font-bold leading-none text-white bg-red-400 rounded-full">
                                                                        N
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {post.authorName}
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-muted-foreground">
                                                            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                                                year: '2-digit',
                                                                month: '2-digit', 
                                                                day: '2-digit'
                                                            })}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                            
                            {/* 페이징 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1"
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
                                                className="w-8"
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
                                        className="flex items-center gap-1"
                                    >
                                        다음
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. 글쓰기/수정 화면 */}
                    {(viewMode === 'write' || viewMode === 'edit') && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (viewMode === 'edit') {
                                            setViewMode('detail');
                                        } else {
                                            setViewMode('list');
                                            navigate('/student/community');
                                        }
                                    }}
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
                                            onClick={viewMode === 'write' ? handleCreatePost : handleUpdatePost}
                                            className="flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            {viewMode === 'write' ? '등록' : '수정 완료'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (viewMode === 'edit') {
                                                    setViewMode('detail');
                                                } else {
                                                    setViewMode('list');
                                                    navigate('/student/community');
                                                }
                                            }}
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
                                    navigate('/student/community');
                                    fetchPosts();
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
                                            <span
                                                className="
                                                inline-flex items-center justify-center
                                                w-3.5 h-3.5 ml-1
                                                text-[10px] font-bold leading-none
                                                text-white bg-red-400
                                                rounded-full
                                            "
                                            >
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
                                            {selectedPost.comments
                                                .slice() // 원본 state 보호 (중요)
                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 최신순
                                                .map(comment => (
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
                                                                            <span
                                                                                className="
                                                                                inline-flex items-center justify-center
                                                                                w-3.5 h-3.5 ml-1
                                                                                text-[10px] font-bold leading-none
                                                                                text-white bg-red-400
                                                                                rounded-full
                                                                            "
                                                                            >
                                                                                N
                                                                            </span>
                                                                        )}
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