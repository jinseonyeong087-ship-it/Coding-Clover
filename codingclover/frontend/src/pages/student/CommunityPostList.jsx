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
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, EyeOff, Eye } from "lucide-react";

const CommunityPostList = () => {
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('list');
    const [posts, setPosts] = useState([]);
    const [postForm, setPostForm] = useState({ title: '', content: '' });

    // 검색 및 페이징 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(15);

    // 정렬 상태
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' 또는 'oldest'

    // 내가 쓴 글 필터 상태
    const [myPostsOnly, setMyPostsOnly] = useState(false);

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

    // 검색 및 필터링
    useEffect(() => {
        let filtered = [...posts];

        // 검색 필터링
        if (searchTerm) {
            const normalizedSearchTerm = searchTerm.trim().toLowerCase();

            filtered = filtered.filter(post => {
                const titleMatch = post.title.toLowerCase().includes(normalizedSearchTerm);
                const contentMatch = post.content.toLowerCase().includes(normalizedSearchTerm);
                const authorMatch = post.authorName.toLowerCase().includes(normalizedSearchTerm);

                // 영어/숫자 검색 향상을 위한 추가 검색
                const titleMatchNormal = post.title.includes(searchTerm);
                const contentMatchNormal = post.content.includes(searchTerm);
                const authorMatchNormal = post.authorName.includes(searchTerm);

                return titleMatch || contentMatch || authorMatch ||
                    titleMatchNormal || contentMatchNormal || authorMatchNormal;
            });
        }

        // 내가 쓴 글 필터링
        if (myPostsOnly && currentUser) {
            filtered = filtered.filter(post => {
                // 내가 작성한 글이거나
                const isMyPost = post.authorName === currentUser.name;
                // 내가 댓글을 단 글인지 확인
                const hasMyComment = post.comments && post.comments.some(
                    comment => comment.authorName === currentUser.name
                );
                return isMyPost || hasMyComment;
            });
        }

        // 정렬 적용
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredPosts(filtered);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    }, [posts, searchTerm, sortOrder, myPostsOnly, currentUser]);

    const fetchPosts = () => {
        axios.get('/api/community/posts', { withCredentials: true })
            .then(res => {
                const data = res.data;
                const items = Array.isArray(data) ? data : (data?.content || []);
                setPosts(items);
            })
            .catch(err => console.error(err));
    };

    const fetchPostDetail = (id) => {
        navigate(`/student/community/posts/${id}`);
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

    // 정렬 핸들러
    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
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

    const handleTogglePostVisibility = (post, event) => {
        event.stopPropagation();
        const isHidden = post.status === 'HIDDEN';
        const endpoint = isHidden ? `/api/community/posts/${post.id}/unhide` : `/api/community/posts/${post.id}/hide`;
        axios.put(endpoint, {}, { withCredentials: true })
            .then(() => fetchPosts())
            .catch(err => alert("상태 변경 실패: " + (err.response?.data || err.message)));
    };

    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    const columnCount = isAdmin ? 5 : 4;

    return (
        <>
            <Nav />
            <div className='py-8' />
            <div className="container mx-auto px-4 py-12 relative">
                {/* Background Decoration */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block">자유게시판</h1>
                        <p className="text-muted-foreground text-lg">지식을 공유하고 함께 성장하는 공간입니다.</p>
                    </div>

                    {/* 1. 목록 화면 */}
                    {viewMode === 'list' && (
                        <div className="space-y-6">
                            <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg">
                                <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-border/50">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-96">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                placeholder="검색어를 입력하세요 (제목, 내용, 작성자)"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="pl-10 h-11 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                        {currentUser && currentUser.role !== 'ADMIN' && (
                                            <Button
                                                variant={myPostsOnly ? "default" : "secondary"}
                                                onClick={() => setMyPostsOnly(!myPostsOnly)}
                                                className="h-11"
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                {myPostsOnly ? '전체 글 보기' : '내가 쓴 글'}
                                            </Button>
                                        )}
                                        {currentUser && currentUser.role !== 'ADMIN' && (
                                            <Button
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        alert('로그인이 필요합니다.');
                                                        return;
                                                    }
                                                    setPostForm({ title: '', content: '' });
                                                    setViewMode('write');
                                                }}
                                                className="h-11 shadow-md hover:shadow-primary/25"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                글쓰기
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
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
                                                        작성일
                                                        {sortOrder === 'newest' ?
                                                            <ChevronDown className="h-3 w-3" /> :
                                                            <ChevronUp className="h-3 w-3" />
                                                        }
                                                    </div>
                                                </TableHead>
                                                {isAdmin && (
                                                    <TableHead className="w-28 text-center font-semibold">관리</TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentPosts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={columnCount} className="h-48 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                            <MessageCircle className="h-10 w-10 opacity-20" />
                                                            <p>{searchTerm ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                currentPosts.map((post, index) => {
                                                    const postNumber = filteredPosts.length - (indexOfFirstPost + index);
                                                    return (
                                                        <TableRow
                                                            key={post.id}
                                                            onClick={() => fetchPostDetail(post.id)}
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                                        >
                                                            <TableCell className="text-center font-medium text-muted-foreground group-hover:text-foreground">
                                                                {postNumber}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2 py-1">
                                                                    <span className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">{post.title}</span>
                                                                    {post.commentCount > 0 && (
                                                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                                                                            {post.commentCount}
                                                                        </Badge>
                                                                    )}
                                                                    {post.status === 'HIDDEN' && (
                                                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">숨김</Badge>
                                                                    )}
                                                                    {isNewPost(post.createdAt) && (
                                                                        <Badge className="h-4 w-4 rounded-full bg-red-500 border-none flex items-center justify-center p-0 text-[9px] font-bold">N</Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                        {post.authorName.charAt(0)}
                                                                    </div>
                                                                    <span className="text-sm font-medium">{post.authorName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                })}
                                                            </TableCell>
                                                            {isAdmin && (
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        size="sm"
                                                                        variant={post.status === 'HIDDEN' ? "default" : "outline"}
                                                                        onClick={(event) => handleTogglePostVisibility(post, event)}
                                                                        className="h-8"
                                                                    >
                                                                        {post.status === 'HIDDEN' ? (
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
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* 페이징 */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="h-9 w-9"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className={`w-9 h-9 font-medium ${currentPage === page ? 'shadow-md' : 'text-muted-foreground'}`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="h-9 w-9"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. 글쓰기/수정 화면 */}
                    {viewMode === 'write' && (
                        <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg border-2">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setViewMode('list');
                                            navigate('/student/community');
                                        }}
                                        className="-ml-2 hover:bg-transparent hover:text-primary"
                                    >
                                        <ArrowLeft className="h-6 w-6" />
                                    </Button>
                                    <CardTitle>새 게시글 작성</CardTitle>
                                </div>
                                <CardDescription>커뮤니티 가이드라인을 준수하여 작성해주세요.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                        placeholder="내용을 자유롭게 작성해보세요..."
                                        value={postForm.content}
                                        onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                        className="min-h-[400px] text-base leading-relaxed bg-background/50 resize-none p-4"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setViewMode('list')}
                                        className="w-24"
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={handleCreatePost}
                                        className="w-32 shadow-lg"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        등록하기
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <Tail />
        </>
    );
};

export default CommunityPostList;