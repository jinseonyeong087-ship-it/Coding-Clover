import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// const BASE_URL = 'coding-clover-db.cdu22ui02zs2.ap-northeast-2.rds.amazonaws.com';
// const BASE_URL = 'https://API 서버 기본 주소 넣기';

const Signup = () => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    role: 'STUDENT' // 기본값: 수강생
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    // 로그인 ID 검사
    if (!formData.loginId.trim()) {
      newErrors.loginId = '아이디를 입력해주세요.';
    } else if (formData.loginId.length < 4 || formData.loginId.length > 50) {
      newErrors.loginId = 'ID는 4자 이상이여야 합니다.';
    }

    // 비밀번호 검사
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // 이름 검사
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    // 이메일 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 역할 선택 검사
    if (!formData.role) {
      newErrors.role = '회원 유형을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API 호출 (실제 백엔드 엔드포인트로 수정 필요)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        // 로그인 페이지로 이동 또는 다른 처리
        // window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(errorData.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">회원가입</h2>
              
              <form onSubmit={handleSubmit}>
                {/* 회원 유형 선택 */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    회원 유형 선택 <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check flex-fill">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleStudent"
                        value="STUDENT"
                        checked={formData.role === 'STUDENT'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label w-100" htmlFor="roleStudent">
                        <div className="border rounded p-3 h-100">
                          <h5 className="mb-2">
                            <i className="bi bi-person-fill me-2"></i>
                            수강생
                          </h5>
                        </div>
                      </label>
                    </div>
                    
                    <div className="form-check flex-fill">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="roleInstructor"
                        value="INSTRUCTOR"
                        checked={formData.role === 'INSTRUCTOR'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label w-100" htmlFor="roleInstructor">
                        <div className="border rounded p-3 h-100">
                          <h5 className="mb-2">
                            <i className="bi bi-person-badge-fill me-2"></i>
                            강사
                          </h5>
                        </div>
                      </label>
                    </div>
                  </div>
                  {errors.role && (
                    <div className="text-danger small mt-1">{errors.role}</div>
                  )}
                </div>

                {/* 로그인 ID */}
                <div className="mb-3">
                  <label htmlFor="loginId" className="form-label">
                    로그인 ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.loginId ? 'is-invalid' : ''}`}
                    id="loginId"
                    name="loginId"
                    value={formData.loginId}
                    onChange={handleChange}
                    placeholder="아이디를 입력해 주세요."
                    maxLength={50}
                  />
                  {errors.loginId && (
                    <div className="invalid-feedback">{errors.loginId}</div>
                  )}
                </div>

                {/* 이름 */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    성명 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    maxLength={50}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* 이메일 */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    이메일 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    maxLength={100}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* 비밀번호 */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    비밀번호 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8자 이상의 비밀번호"
                    maxLength={255}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                {/* 비밀번호 확인 */}
                <div className="mb-4">
                  <label htmlFor="passwordConfirm" className="form-label">
                    비밀번호 확인 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  {errors.passwordConfirm && (
                    <div className="invalid-feedback">{errors.passwordConfirm}</div>
                  )}
                </div>

                {/* 제출 버튼 */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        처리 중...
                      </>
                    ) : (
                      '가입하기'
                    )}
                  </button>
                </div>
              </form>

              {/* 로그인 링크 */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  이미 계정이 있으신가요?{' '}
                  <a href="/login" className="text-decoration-none">
                    로그인
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;