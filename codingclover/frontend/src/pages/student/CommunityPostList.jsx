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
        return now - created <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        fetchPosts();
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
        let filtered = [...posts];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.content.toLowerCase().includes(term) ||
                p.authorName.toLowerCase().includes(term)
            );
        }

        if (myPostsOnly && currentUser) {
            filtered = filtered.filter(p => p.authorName === currentUser.name);
        }

        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        setFilteredPosts(filtered);
        setCurrentPage(1);
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

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handlePageChange = (n) => setCurrentPage(n);
    const handleSortToggle = () => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');

    const handleCreatePost = () => {
        if (!postForm.title || !postForm.content) return alert("내용을 입력해주세요.");
        axios.post('/api/community/posts/new', postForm, { withCredentials: true })
            .then(() => {
                alert("등록되었습니다.");
                setPostForm({ title: '', content: '' });
                setViewMode('list');
                fetchPosts();
            })
            .catch(err => alert("등록 실패"));
    };

    const isAdmin = currentUser && currentUser.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Nav />
            <div className="h-0"></div>
            {/* Header Section (Notice Style) */}
            <div className="border-b border-gray-200 bg-gray-50/50">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
                            자유게시판
                        </h1>
                        <p className="text-lg text-gray-500">
                            지식을 공유하고 함께 성장하는 공간입니다.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto space-y-8">

                    {viewMode === 'list' ? (
                        <div className="space-y-6">
                            {/* Search & Action Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="제목, 내용, 작성자 검색..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="pl-10 h-10 rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary w-full"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {currentUser && currentUser.role !== 'ADMIN' && (
                                        <Button
                                            variant={myPostsOnly ? "default" : "outline"}
                                            onClick={() => setMyPostsOnly(!myPostsOnly)}
                                            size="sm"
                                            className={`h-10 px-4 rounded-none font-bold ${myPostsOnly ? 'bg-primary text-white' : 'border-gray-300 text-gray-600'}`}
                                        >
                                            내가 쓴 글
                                        </Button>
                                    )}
                                    {currentUser && currentUser.role !== 'ADMIN' && (
                                        <Button
                                            onClick={() => setViewMode('write')}
                                            className="h-10 rounded-none bg-primary hover:bg-primary/90 text-white font-bold px-6"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            글쓰기
                                        </Button>
                                    )}
                                </div>
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
                                                    작성일
                                                    {sortOrder === 'newest' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPosts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-48 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <MessageCircle className="w-12 h-12 text-gray-300" />
                                                        <p>게시글이 없습니다.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentPosts.map((post, idx) => (
                                                <TableRow
                                                    key={post.id}
                                                    className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                    onClick={() => fetchPostDetail(post.id)}
                                                >
                                                    <TableCell className="text-center font-medium text-gray-400">
                                                        {filteredPosts.length - (indexOfFirstPost + idx)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 py-1">
                                                            <span className="font-medium text-base text-gray-900 group-hover:text-primary">{post.title}</span>
                                                            {post.commentCount > 0 && (
                                                                <span className="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-blue-600 bg-blue-50 rounded px-1">
                                                                    {post.commentCount}
                                                                </span>
                                                            )}
                                                            {isNewPost(post.createdAt) && (
                                                                <Badge className="h-5 rounded-none bg-red-600 text-white border-none text-[10px] px-1.5 font-bold">NEW</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm font-medium text-gray-600">{post.authorName}</TableCell>
                                                    <TableCell className="text-center text-sm text-gray-500">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages >= 1 && (
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
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">새 게시글 작성</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-none border-gray-300"
                                >
                                    목록으로
                                </Button>
                            </div>

                            <Card className="border border-gray-200 shadow-none rounded-none bg-white">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">제목</Label>
                                        <Input
                                            placeholder="제목을 입력하세요"
                                            value={postForm.title}
                                            onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                                            className="h-12 text-lg rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700">내용</Label>
                                        <Textarea
                                            placeholder="공유하고 싶은 소식을 자유롭게 남겨주세요."
                                            value={postForm.content}
                                            onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                            className="min-h-[400px] text-base leading-relaxed p-4 rounded-none border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                                        />
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
                                            onClick={handleCreatePost}
                                            className="px-8 py-2.5 h-auto rounded-none bg-primary hover:bg-primary/90 text-white font-bold"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            등록하기
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            <Tail />
        </div >
    );
};

export default CommunityPostList;