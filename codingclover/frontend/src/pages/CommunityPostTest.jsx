import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityPostTest = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

    const fetchPosts = () => {
        // 주소에서 /api를 빼고 호출해 보세요 (백엔드와 맞춤)
        axios.get('/api/community/posts', { withCredentials: true })
            .then(res => setPosts(res.data))
            .catch(err => console.log("조회 에러: ", err.response?.status));
    };

    useEffect(() => { fetchPosts(); }, []);

    const handlePostSubmit = () => {
        // 문법 오류 방지를 위해 axios 호출 구조를 명확히 함
        axios({
            method: 'post',
            url: '/api/community/posts/new',
            data: newPost,
            withCredentials: true
        })
            .then((res) => {
                alert("등록 성공!");
                setNewPost({ title: '', content: '' });
                fetchPosts();
            })
            .catch((err) => {
                console.error("등록 실패 로그:", err.response);
                alert("에러 발생: " + (err.response?.status || "네트워크 오류"));
            });
    };

    return (
        <div style={{ padding: '20px', background: 'white' }}>
            <h2>커뮤니티 최종 테스트</h2>
            <div style={{ marginBottom: '20px' }}>
                <input placeholder="제목" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} style={{ width: '100%' }} /><br />
                <textarea placeholder="내용" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} style={{ width: '100%', height: '80px' }} /><br />
                <button onClick={handlePostSubmit}>게시글 등록</button>
            </div>
            <table border="1" style={{ width: '100%' }}>
                <thead><tr><th>ID</th><th>제목</th><th>작성자</th></tr></thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.postId}>
                            <td>{post.postId}</td>
                            <td>{post.title}</td>
                            <td>{post.user?.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommunityPostTest;