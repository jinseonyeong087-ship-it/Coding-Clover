import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const TestSearch = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || 'COURSE'; // 기본값 COURSE
    const keyword = searchParams.get('keyword') || '';
    
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (keyword) {
            // 백엔드 API 호출 테스트
            axios.get('/admin/search', {
                params: { category, keyword }
            })
            .then(res => {
                console.log("받은 데이터:", res.data);
                // Spring Page 객체는 content 배열 안에 데이터가 들어있음
                setData(res.data.content || []);
            })
            .catch(err => {
                console.error("에러 발생:", err);
                setError(err.message);
            });
        }
    }, [category, keyword]);

//     // TestSearch.jsx 내부
// useEffect(() => {
//     if (keyword) {
//         // 이 주소가 백엔드 AdminController의 @GetMapping("/api/admin/search")와 일치해야 합니다.
//         axios.get('/admin/search', {
//             params: { category, keyword }
//         })
//         .then(res => {
//             console.log("백엔드 응답:", res.data);
//             setData(res.data.content || []); // JPA Page 객체일 경우 .content 사용
//         })
//         .catch(err => console.error("통신 에러:", err));
//     }
// }, [category, keyword]);

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
            <h1>🔍 검색 기능 테스트 페이지</h1>
            <div style={{ marginBottom: '20px', padding: '10px', background: '#fff' }}>
                <p><strong>URL 파라미터 상태</strong></p>
                <ul>
                    <li>카테고리: {category}</li>
                    <li>검색어: {keyword}</li>
                </ul>
            </div>

            {error && <div style={{ color: 'red' }}>에러: {error}</div>}

            <h3>결과 목록 ({data.length}건)</h3>
            <div style={{ background: '#fff', padding: '10px' }}>
                {data.length > 0 ? (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                ) : (
                    <p>검색 결과가 없거나 검색어를 입력하지 않았습니다.</p>
                )}
            </div>
        </div>
    );
};

export default TestSearch;