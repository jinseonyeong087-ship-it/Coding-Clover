import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, ArrowLeft, GraduationCap, Laptop } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    role: 'STUDENT',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.loginId.trim()) newErrors.loginId = '아이디를 입력해 주세요.';
    if (!formData.name.trim()) newErrors.name = '이름을 입력해 주세요.';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해 주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 형식이 아닙니다.';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해 주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    if (!formData.role) newErrors.role = '회원 유형을 선택해 주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/auth/login');
      } else {
        const errorData = await response.json();
        setErrors(errorData || { global: '회원가입 실패' });
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-gray-900">
      {/* Left: Brand Side */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] text-white p-12 lg:p-20 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight mb-8 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <div className="mt-20">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Join the<br />
              <span className="text-primary">New Generation</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              Coding-Clover 커뮤니티의 일원이 되세요.<br />
              함께 성장하고, 지식을 공유하는 여정이 시작됩니다.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 text-sm text-gray-400">
          <div>
            <h4 className="font-bold text-white mb-2">For Students</h4>
            <p>체계적인 학습 로드맵과 실전 프로젝트로 실력을 키우세요.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">For Instructors</h4>
            <p>당신의 지식을 공유하고 수익을 창출하세요.</p>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[200px]"></div>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">회원가입</h2>
            <p className="mt-2 text-gray-500">이미 계정이 있으신가요? <Link to="/auth/login" className="font-bold text-primary hover:underline">로그인</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {errors.global && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium border-l-4 border-red-500">{errors.global}</div>
            )}

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-700">회원 유형 <span className="text-red-500">*</span></Label>
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="STUDENT" id="roleStudent" className="peer sr-only" />
                  <Label htmlFor="roleStudent" className={cn(
                    "flex flex-col items-center justify-center border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-all rounded-none",
                    formData.role === 'STUDENT' && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}>
                    <GraduationCap className={cn("w-6 h-6 mb-2 text-gray-400", formData.role === 'STUDENT' && "text-primary")} />
                    <span className="font-bold">수강생</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="INSTRUCTOR" id="roleInstructor" className="peer sr-only" />
                  <Label htmlFor="roleInstructor" className={cn(
                    "flex flex-col items-center justify-center border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-all rounded-none",
                    formData.role === 'INSTRUCTOR' && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}>
                    <Laptop className={cn("w-6 h-6 mb-2 text-gray-400", formData.role === 'INSTRUCTOR' && "text-primary")} />
                    <span className="font-bold">강사</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.role && <p className="text-xs text-red-500 font-medium">{errors.role}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId" className="text-sm font-bold text-gray-700">아이디 <span className="text-red-500">*</span></Label>
                <Input type="text" id="loginId" name="loginId" value={formData.loginId} onChange={handleChange} className={cn("h-12 rounded-none border-gray-300 focus:border-primary", errors.loginId && "border-red-500")} placeholder="아이디를 입력하세요" />
                {errors.loginId && <p className="text-xs text-red-500">{errors.loginId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-gray-700">이름 <span className="text-red-500">*</span></Label>
                  <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={cn("h-12 rounded-none border-gray-300 focus:border-primary", errors.name && "border-red-500")} placeholder="실명 입력" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700">이메일 <span className="text-red-500">*</span></Label>
                  <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={cn("h-12 rounded-none border-gray-300 focus:border-primary", errors.email && "border-red-500")} placeholder="example@email.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-gray-700">비밀번호 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} className={cn("h-12 pr-10 rounded-none border-gray-300 focus:border-primary", errors.password && "border-red-500")} placeholder="8자 이상 입력" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-sm font-bold text-gray-700">비밀번호 확인 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showPasswordConfirm ? "text" : "password"} id="passwordConfirm" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} className={cn("h-12 pr-10 rounded-none border-gray-300 focus:border-primary", errors.passwordConfirm && "border-red-500")} placeholder="비밀번호 재입력" />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="text-xs text-red-500">{errors.passwordConfirm}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-none shadow-none" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '회원가입 완료'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
