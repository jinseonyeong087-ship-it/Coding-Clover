import React, { useState } from 'react';
import Nav from '@/components/Nav';
import Tail from '../components/Tail';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    role: 'STUDENT'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));

    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.loginId.trim()) {
      newErrors.loginId = '아이디를 입력해주세요.';
    } else if (formData.loginId.length < 4 || formData.loginId.length > 50) {
      newErrors.loginId = 'ID는 4자 이상이여야 합니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.role) {
      newErrors.role = '회원 유형을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate("/auth/login");
      } else {
        const errorData = await response.json();
        // 서버에서 반환한 필드별 에러를 errors 상태에 반영
        setErrors(errorData);
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      {/* Background Decoration */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <Card className="w-full max-w-lg border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-8 pt-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">회원가입</CardTitle>
            <CardDescription className="text-base">
              Coding-Clover와 함께 성장을 시작하세요
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* 전역 에러 메시지 */}
              {errors.global && (
                <p className="text-sm text-destructive text-center">{errors.global}</p>
              )}
              {/* 회원 유형 선택 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  회원 유형 선택 <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="STUDENT"
                      id="roleStudent"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="roleStudent"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-white/50 backdrop-blur-sm p-6 hover:bg-accent/50 hover:border-primary/50 cursor-pointer transition-all duration-200 shadow-sm",
                        formData.role === 'STUDENT' && "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 ring-offset-0"
                      )}
                    >
                      <div className={cn("p-2 rounded-full mb-3 bg-muted transition-colors", formData.role === 'STUDENT' && "bg-primary text-primary-foreground")}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="text-base font-bold">수강생</span>
                      <span className="text-xs text-muted-foreground mt-1">학습을 시작하고 싶어요</span>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="INSTRUCTOR"
                      id="roleInstructor"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="roleInstructor"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-white/50 backdrop-blur-sm p-6 hover:bg-accent/50 hover:border-primary/50 cursor-pointer transition-all duration-200 shadow-sm",
                        formData.role === 'INSTRUCTOR' && "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 ring-offset-0"
                      )}
                    >
                      <div className={cn("p-2 rounded-full mb-3 bg-muted transition-colors", formData.role === 'INSTRUCTOR' && "bg-primary text-primary-foreground")}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <span className="text-base font-bold">강사</span>
                      <span className="text-xs text-muted-foreground mt-1">지식을 공유하고 싶어요</span>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.role && (
                  <p className="text-sm text-destructive font-medium ml-1">{errors.role}</p>
                )}
              </div>

              {/* 로그인 ID */}
              <div className="space-y-2">
                <Label htmlFor="loginId">
                  로그인 ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="loginId"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="아이디를 입력해 주세요"
                  maxLength={50}
                  className={cn(errors.loginId && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.loginId && (
                  <p className="text-sm text-destructive">{errors.loginId}</p>
                )}
              </div>

              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  성명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                  maxLength={50}
                  className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  maxLength={100}
                  className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8자 이상의 비밀번호를 입력해 주세요"
                    maxLength={255}
                    className={cn("pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">
                  비밀번호 확인 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPasswordConfirm ? "text" : "password"}
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={cn("pr-10", errors.passwordConfirm && "border-destructive focus-visible:ring-destructive")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.passwordConfirm && (
                  <p className="text-sm text-destructive">{errors.passwordConfirm}</p>
                )}
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    처리 중...
                  </>
                ) : (
                  '가입하기'
                )}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="font-medium text-primary underline-offset-4 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                로그인
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Tail />
    </div>
  );
};

export default Register;
