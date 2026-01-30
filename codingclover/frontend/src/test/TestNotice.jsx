import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// UI Components (Reusing inline styles for simplicity in test file)
const TestNotice = () => {
  const navigate = useNavigate();

  // States
  const [mode, setMode] = useState('USER'); // 'USER' or 'ADMIN'
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', status: 'VISIBLE' });
  const [isEditing, setIsEditing] = useState(false);

  // Auth Status (Simulated or Real)
  const [myRole, setMyRole] = useState('');

  useEffect(() => {
    checkAuth();
    fetchNotices();
  }, [mode]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/auth/status');
      if (res.data.loggedIn) {
        setMyRole(res.data.user.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotices = async () => {
    try {
      const url = mode === 'ADMIN' ? '/admin/notice' : '/notice';
      const res = await axios.get(url);
      console.log("Notice API Response:", res.data);

      if (Array.isArray(res.data)) {
        console.log(`Loaded ${res.data.length} notices.`);
        setNotices(res.data);
      } else {
        console.error("Response is not an array:", res.data);
        setNotices([]);
        alert("서버 응답 형식이 올바르지 않습니다. (Array expected)");
      }
      setSelectedNotice(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to fetch notices", err);
      const errMsg = err.response?.data?.message || err.response?.data || err.message;
      setNotices([]); // Reset to empty on error
      alert(`데이터 불러오기 실패: ${errMsg}\n\n* 중요: 백엔드 코드가 수정되었습니다. 백엔드 서버를 반드시 재시작해주세요.`);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/admin/notice', form);
      alert("공지사항 등록 성공");
      setForm({ title: '', content: '', status: 'VISIBLE' });
      fetchNotices();
    } catch (err) {
      alert("등록 실패: " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNotice) return;
    try {
      await axios.put(`/admin/notice/${selectedNotice.noticeId}`, form);
      alert("수정 성공");
      setIsEditing(false);
      fetchNotices();
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/admin/notice/${id}`);
      alert("삭제 성공");
      fetchNotices();
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await axios.get(`/notice/${id}`);
      setSelectedNotice(res.data);
      setIsEditing(false);
    } catch (err) {
      // Admin URL might need to be used if it's hidden and user endpoint blocks it? 
      // Based on controller, /notice/{id} returns detail always, 
      // but logic usually blocks hidden for users. 
      // Current controller seems to allow it in `getNoticeDetail` unless service blocks it.
      // Let's assume /notice/{id} works.
      alert("상세 조회 실패: " + err.message);
    }
  };

  const startEdit = (notice) => {
    setSelectedNotice(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      status: notice.status || 'VISIBLE'
    });
    setIsEditing(true);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Notice Test Page</h1>

      {/* Mode Switcher */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => setMode('USER')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'USER' ? '#333' : '#eee',
            color: mode === 'USER' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          User View (Public)
        </button>
        <button
          onClick={() => setMode('ADMIN')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'ADMIN' ? '#d32f2f' : '#eee',
            color: mode === 'ADMIN' ? 'white' : 'black',
            border: '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          Admin View (Management)
        </button>
        <span style={{ fontSize: '12px', color: '#666' }}>Current Role: {myRole || 'GUEST'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left: List */}
        <div>
          <h3>📢 Notice List ({notices.length})</h3>
          {/* Debug Info */}
          {notices.length === 0 && (
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', fontSize: '12px', color: '#856404', marginBottom: '10px' }}>
              데이터가 없거나 로드에 실패했습니다. 콘솔(F12)을 확인하세요.
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd' }}>
            {notices.map(notice => (
              <li key={notice.noticeId} style={{ borderBottom: '1px solid #eee', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span
                    onClick={() => openDetail(notice.noticeId)}
                    style={{ fontWeight: 'bold', cursor: 'pointer', color: '#007bff' }}
                  >
                    [{notice.noticeId}] {notice.title}
                  </span>
                  {mode === 'ADMIN' && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 5px',
                      backgroundColor: notice.status === 'VISIBLE' ? '#e8f5e9' : '#ffebee',
                      color: notice.status === 'VISIBLE' ? '#2e7d32' : '#c62828',
                      borderRadius: '4px'
                    }}>
                      {notice.status}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {new Date(notice.createdAt).toLocaleString()}
                </div>
                {mode === 'ADMIN' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => startEdit(notice)} style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(notice.noticeId)} style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer', backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' }}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Detail or Form */}
        <div>
          {mode === 'ADMIN' && (
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>{isEditing ? '✏️ Edit Notice' : '📝 Create New Notice'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #ccc' }}
                />
                <textarea
                  placeholder="Content"
                  rows={5}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #ccc' }}
                />
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #ccc' }}
                >
                  <option value="VISIBLE">VISIBLE</option>
                  <option value="HIDDEN">HIDDEN</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {isEditing ? (
                    <>
                      <button onClick={handleUpdate} style={{ padding: '10px', backgroundColor: '#1976d2', color: 'white', border: 'none', cursor: 'pointer', flex: 1 }}>Update</button>
                      <button onClick={() => { setIsEditing(false); setForm({ title: '', content: '', status: 'VISIBLE' }); }} style={{ padding: '10px', backgroundColor: '#ccc', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={handleCreate} style={{ padding: '10px', backgroundColor: '#2e7d32', color: 'white', border: 'none', cursor: 'pointer', flex: 1 }}>Create</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detail View */}
          {selectedNotice ? (
            <div style={{ padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0 }}>{selectedNotice.title}</h2>
              <div style={{ fontSize: '12px', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                <span>Date: {new Date(selectedNotice.createdAt).toLocaleString()}</span>
                <span style={{ marginLeft: '10px' }}>Status: {selectedNotice.status}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {selectedNotice.content}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', color: '#ccc', textAlign: 'center', border: '2px dashed #eee' }}>
              Select a notice to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestNotice;
