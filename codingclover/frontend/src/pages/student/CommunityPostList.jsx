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
import { MessageCircle, Edit, Trash2, Send, User, Calendar, ArrowLeft, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

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
            .then(res => setPosts(res.data))
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

    return (
        <>
            <Nav />
            <div className='py-8'/>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">자유게시판</h1>

                    {/* 1. 목록 화면 */}
                    {viewMode === 'list' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-6 w-6" />
                                    <span className="text-sm font-bold">
        {filteredPosts.length}개
    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {currentUser && currentUser.role !== 'ADMIN' && (
                                        <Button
                                            variant={myPostsOnly ? "default" : "outline"}
                                            onClick={() => setMyPostsOnly(!myPostsOnly)}
                                            className="flex items-center gap-2 h-9"
                                            size="sm"
                                        >
                                            <User className="h-4 w-4" />
                                            {myPostsOnly ? '전체 글 보기' : '내가 쓴 글 보기'}
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
                                            className="flex items-center gap-2 h-9"
                                        >
                                            <Edit className="h-4 w-4" />
                                            글쓰기
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* 검색 */}
                            <div className="flex items-center gap-2 max-w-md">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="제목, 작성자, 내용 검색"
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
                                            <TableHead 
                                                className="w-32 text-center cursor-pointer hover:bg-muted/50 select-none"
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
                    {viewMode === 'write' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setViewMode('list');
                                        navigate('/student/community');
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    목록으로
                                </Button>
                                <h2 className="text-2xl font-bold">새 게시글 작성</h2>
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
                                            onClick={handleCreatePost}
                                            className="flex items-center gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            등록
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('list')}
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
        </>
    );
};

export default CommunityPostList;