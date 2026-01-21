
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

function CodingTest() {
  const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 실행 핸들러
  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setError(null);

    try {
      // API 요청 (임시 ID 1번 사용)
      const response = await fetch('/api/problems/1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ...' // (로그인이 필요하면 토큰 추가)
        },
        body: JSON.stringify({
          code: code,
          input: '' // 필요 시 입력값 추가
        }),
      });

      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.output);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', height: '100vh', flexDirection: 'column' }}>
      <h1>💻 코딩 테스트 연습 (Prototype)</h1>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        {/* 왼쪽: 에디터 */}
        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* 오른쪽: 결과창 */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleRun}
            disabled={loading}
            style={{
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '실행 중...' : '▶ 코드 실행 (Run)'}
          </button>

          <div style={{
            flex: 1,
            backgroundColor: '#1e1e1e',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto'
          }}>
            <h3>실행 결과:</h3>
            {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
            {!error && output && <div style={{ color: '#51cf66' }}>{output}</div>}
            {!error && !output && <span style={{ color: '#666' }}>실행 결과가 여기에 표시됩니다.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodingTest;
