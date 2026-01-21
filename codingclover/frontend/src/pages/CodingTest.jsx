
import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function CodingTest() {
  const [problems, setProblems] = useState([]);
  const [selectedId, setSelectedId] = useState(1);
  const [code, setCode] = useState(`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 코드를 작성하세요
    }
}`);
  const [inputData, setInputData] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);

  // 문제 목록 불러오기
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        if (data.length > 0) {
          setSelectedId(data[0].problemId);
        }
      })
      .catch(err => console.error("문제 목록 로딩 실패:", err));
  }, []);

  // 문제 변경 시 자동 예제 입력 (하드코딩된 예시 로직)
  useEffect(() => {
    // 임시: 문제 설명에 따라 적절한 기본 입력값 세팅
    // 실제로는 DB에서 '예제 케이스'를 가져와야 완벽하지만, 지금은 간단하게 처리
    if (selectedId == 1) { // 1번 문제(두 수의 합) -> 입력 없음 (변수형으로 바뀜) or 1 2
      setInputData('1 2');
    } else if (selectedId == 2) { // 2번 문제(홀짝) -> 2
      setInputData('2');
    } else {
      setInputData('');
    }
  }, [selectedId]);

  // 실행 핸들러 (단순 실행)
  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setError(null);
    setGradingResult(null);

    try {
      const response = await fetch(`/api/problems/${selectedId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input: inputData }),
      });
      const data = await response.json();
      if (data.error) setError(data.error);
      else setOutput(data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 제출 핸들러 (채점)
  const handleSubmit = async () => {
    setLoading(true);
    setOutput('');
    setError(null);
    setGradingResult(null);

    try {
      const response = await fetch(`/api/problems/${selectedId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setGradingResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', height: '100vh', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🍀 Coding Clover - Coding Test</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong>문제 선택:</strong>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setOutput('');
              setError(null);
              setGradingResult(null);
              // setInputData는 useEffect에서 처리됨
            }}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            {problems.map(p => (
              <option key={p.problemId} value={p.problemId}>
                [{p.difficulty}] {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* 왼쪽: 에디터 및 문제 설명 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>📝 문제 설명</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {problems.find(p => p.problemId == selectedId)?.description || "문제를 선택해주세요."}
            </p>
          </div>

          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
        </div>

        {/* 오른쪽: 결과창 및 입력창 */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* 입력값(Stdin) 영역 */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>🖥️ 입력값 (Stdin):</label>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              Scanner가 이 값을 읽어갑니다. 원하는 값으로 수정해서 실행해보세요.
            </div>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="여기에 실행할 때 넣을 값(예: 10)을 입력하세요."
              style={{
                width: '100%',
                height: '80px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontFamily: 'monospace',
                backgroundColor: '#fff',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleRun}
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              단순 실행
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              제출 및 채점
            </button>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e1e1e', color: 'white', padding: '15px', borderRadius: '8px', overflowY: 'auto' }}>
            {/* 단순 실행 결과 */}
            {output && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#adb5bd' }}>실행 결과:</h4>
                <div style={{ color: '#51cf66', backgroundColor: '#2d2d2d', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>{output}</div>
              </div>
            )}

            {/* 에러 표시 */}
            {error && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#ff6b6b' }}>Error:</h4>
                <div style={{ color: '#ff6b6b', backgroundColor: '#3d1c1c', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>{error}</div>
              </div>
            )}

            {/* 채점 결과 */}
            {gradingResult && (
              <div style={{
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: gradingResult.passed ? '#064420' : '#4a0e0e',
                border: `2px solid ${gradingResult.passed ? '#51cf66' : '#ff6b6b'}`
              }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
                  {gradingResult.passed ? '✅ 정답입니다!' : '❌ 오답입니다'}
                </h2>
                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                <p><strong>결과:</strong> {gradingResult.message}</p>
                <p><strong>통과 케이스:</strong> {gradingResult.passedCases} / {gradingResult.totalCases}</p>
                <p><strong>소요 시간:</strong> {gradingResult.executionTime}ms</p>
              </div>
            )}

            {!output && !error && !gradingResult && (
              <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
                코드를 작성하고 실행하거나 제출하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodingTest;
