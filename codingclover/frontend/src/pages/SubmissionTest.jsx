import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const SubmissionTest = () => {
  const [userId, setUserId] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // 1. 로컬 스토리지에서 유저 정보 자동 로드
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        const uid = u.userId || u.id;
        setUserId(uid);

        // 2. 유저 ID가 있으면 전체 이력 조회 (문제 ID 없이)
        if (uid) {
          fetchHistoryAuto(uid, null);
        }
      } catch (e) {
        console.error("User parsing error", e);
      }
    }
  }, []);

  const fetchHistoryAuto = async (uid, pid) => {
    try {
      let url = `/api/submission/history?userId=${uid}`;
      if (pid) url += `&problemId=${pid}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // 최신순 정렬
        setHistory(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openCodeModal = (code) => {
    setSelectedCode(code);
  };

  const closeCodeModal = () => {
    setSelectedCode(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Submission History</h1>
          <p className="text-gray-500">User ID: {userId}</p>
        </div>

        <Card>
          <CardHeader><CardTitle>내 제출 이력</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded h-[500px] overflow-y-auto p-2 bg-white">
              {history.length === 0 ? <p className="text-gray-500 text-center py-4">이력이 없습니다.</p> : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left sticky top-0">
                    <tr>
                      <th className="p-3 w-1/6">Time</th>
                      <th className="p-3 w-1/4">Problem</th>
                      <th className="p-3 w-1/6">Status</th>
                      <th className="p-3 w-1/6">Exe Time</th>
                      <th className="p-3 w-1/6">Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item.id} className="border-t hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-medium">{item.problemTitle || `Problem ${item.problemId}`}</td>
                        <td className={`p-3 font-bold ${item.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.status}
                        </td>
                        <td className="p-3">{item.executionTime}ms</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" onClick={() => openCodeModal(item.code)}>
                            View Code
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Modal */}
      {selectedCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeCodeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
              <h3 className="font-bold text-lg">Submitted Code</h3>
              <button onClick={closeCodeModal} className="text-gray-500 hover:text-black text-2xl">&times;</button>
            </div>
            <div className="p-0 overflow-auto flex-1 bg-[#1e1e1e]">
              <pre className="p-4 text-sm font-mono text-gray-200 whitespace-pre-wrap">{selectedCode}</pre>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={closeCodeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionTest;
