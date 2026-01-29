import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityPostTest = () => {
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
                window.history.pushState({ postId: id }, '', `/test/community/posts/${id}`);
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
        <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
            <h1>커뮤니티 게시판</h1>

            {/* 상태 확인용 (정상 작동 확인 후 삭제하세요) */}
            <div style={{ background: '#f8f9fa', padding: '10px', marginBottom: '20px', border: '1px solid #dee2e6', fontSize: '13px' }}>
                <strong>접속 정보:</strong> {currentUser ? `${currentUser.name}(${currentUser.loginId}) 님 로그인 중` : "로그인 정보 없음"}
            </div>

            {/* 1. 목록 화면 */}
            {viewMode === 'list' && (
                <div>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <button onClick={() => { setPostForm({ title: '', content: '' }); setViewMode('write'); }} style={btnStyle}>글쓰기</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead style={{ background: '#f4f4f4' }}>
                            <tr><th style={thStyle}>ID</th><th style={thStyle}>제목</th><th style={thStyle}>작성자</th><th style={thStyle}>작성일</th></tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} onClick={() => fetchPostDetail(post.id)} style={{ cursor: 'pointer', borderBottom: '1px solid #ddd' }}>
                                    <td style={tdStyle}>{post.id}</td><td style={tdStyle}>{post.title}</td><td style={tdStyle}>{post.authorName}</td><td style={tdStyle}>{new Date(post.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 2. 글쓰기/수정 화면 */}
            {(viewMode === 'write' || viewMode === 'edit') && (
                <div>
                    <h2>{viewMode === 'write' ? '새 게시글 작성' : '게시글 수정'}</h2>
                    <input type="text" placeholder="제목" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                    <textarea placeholder="내용" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} style={{ width: '100%', height: '200px', padding: '10px', marginBottom: '10px' }} />
                    <div style={{ textAlign: 'center' }}>
                        <button onClick={viewMode === 'write' ? handleCreatePost : handleUpdatePost} style={{...btnStyle, marginRight: '10px', background: viewMode === 'edit' ? '#4CAF50' : '#007BFF'}}>{viewMode === 'write' ? '등록' : '수정 완료'}</button>
                        <button onClick={() => setViewMode(viewMode === 'edit' ? 'detail' : 'list')} style={{...btnStyle, background: '#ccc'}}>취소</button>
                    </div>
                </div>
            )}

            {/* 4. 상세 화면 */}
            {viewMode === 'detail' && selectedPost && (
                <div>
                    <button onClick={() => { setViewMode('list'); setSelectedPost(null); fetchPosts(); window.history.pushState(null, '', '/test/community'); }} style={{ marginBottom: '20px' }}>&lt; 목록으로</button>
                    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                        <h2>{selectedPost.title}</h2>
                        <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            작성자: {selectedPost.authorName} | 작성일: {new Date(selectedPost.createdAt).toLocaleString()}
                        </div>
                        <div style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>{selectedPost.content}</div>
                        
                        {/* [중요] 게시글 작성자(authorLoginId 또는 authorName)와 비교 */}
                        {isOwner(selectedPost.authorLoginId, selectedPost.authorName) && (
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <button onClick={() => { setPostForm({ title: selectedPost.title, content: selectedPost.content }); setViewMode('edit'); }} style={{...btnStyle, marginRight: '5px', background: '#4CAF50'}}>수정</button>
                                <button onClick={() => handleDeletePost(selectedPost.id)} style={{...btnStyle, background: '#F44336'}}>삭제</button>
                            </div>
                        )}
                    </div>

                    {/* 댓글 UI */}
                    <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9' }}>
                        <h3>댓글 ({selectedPost.comments?.length || 0})</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {selectedPost.comments && selectedPost.comments.map(comment => (
                                <li key={comment.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
                                    {editCommentId === comment.id ? (
                                        <div>
                                            <textarea value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} style={{ width: '100%', height: '60px' }} />
                                            <div style={{ marginTop: '5px' }}>
                                                <button onClick={() => handleUpdateComment(comment.id)} style={{ marginRight: '5px' }}>저장</button>
                                                <button onClick={() => setEditCommentId(null)}>취소</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{comment.authorName}</strong><span>{new Date(comment.createdAt).toLocaleString()}</span></div>
                                            <p style={{ margin: '5px 0' }}>{comment.content}</p>
                                            
                                            {/* [중요] 댓글 작성자와 비교 */}
                                            {isOwner(comment.authorLoginId, comment.authorName) && (
                                                <div>
                                                    <button onClick={() => { setEditCommentId(comment.id); setEditCommentContent(comment.content); }} style={{ fontSize: '0.8em', marginRight: '5px', color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>수정</button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} style={{ fontSize: '0.8em', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div style={{ marginTop: '20px', display: 'flex' }}>
                            <input type="text" placeholder="댓글을 입력하세요..." value={commentContent} onChange={e => setCommentContent(e.target.value)} style={{ flex: 1, padding: '10px' }} />
                            <button onClick={handleCreateComment} style={{...btnStyle, marginLeft: '10px', padding: '10px 20px'}}>등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const thStyle = { padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' };
const tdStyle = { padding: '10px', borderBottom: '1px solid #ddd' };
const btnStyle = { padding: '8px 16px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default CommunityPostTest;