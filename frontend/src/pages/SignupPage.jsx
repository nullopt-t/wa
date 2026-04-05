import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const SignupPage = () => {
  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const firstNameRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTherapistInfo, setShowTherapistInfo] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+20', // Egypt default
    birthDate: '',
    gender: '',
  });

  const [therapistData, setTherapistData] = useState({
    licenseNumber: '',
    specialty: '',
    yearsOfExperience: '',
    education: '',
    certifications: '',
    clinicAddress: '',
    city: '',
    country: '',
    bio: '',
    languages: ''
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Common country codes - Arabic countries only
  const countryCodes = [
    { code: '+20', label: '🇪🇬 مصر', name: 'مصر' },
    { code: '+966', label: '🇸🇦 السعودية', name: 'السعودية' },
    { code: '+971', label: '🇦🇪 الإمارات', name: 'الإمارات' },
    { code: '+965', label: '🇰🇼 الكويت', name: 'الكويت' },
    { code: '+974', label: '🇶🇦 قطر', name: 'قطر' },
    { code: '+968', label: '🇴🇲 عمان', name: 'عمان' },
    { code: '+973', label: '🇧🇭 البحرين', name: 'البحرين' },
    { code: '+962', label: '🇯🇴 الأردن', name: 'الأردن' },
    { code: '+961', label: '🇱🇧 لبنان', name: 'لبنان' },
    { code: '+964', label: '🇮🇶 العراق', name: 'العراق' },
    { code: '+963', label: '🇸🇾 سوريا', name: 'سوريا' },
    { code: '+967', label: '🇾🇪 اليمن', name: 'اليمن' },
    { code: '+970', label: '🇵🇸 فلسطين', name: 'فلسطين' },
    { code: '+212', label: '🇲🇦 المغرب', name: 'المغرب' },
    { code: '+213', label: '🇩🇿 الجزائر', name: 'الجزائر' },
    { code: '+216', label: '🇹🇳 تونس', name: 'تونس' },
    { code: '+218', label: '🇱🇾 ليبيا', name: 'ليبيا' },
    { code: '+249', label: '🇸🇩 السودان', name: 'السودان' },
    { code: '+222', label: '🇲🇷 موريتانيا', name: 'موريتانيا' },
  ];

  // Prevent browser's default validation styling
  useEffect(() => {
    firstNameRef.current?.focus();

    // Disable autofill yellow background and fix input colors
    const style = document.createElement('style');
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-text-fill-color: var(--text-primary) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
      input:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--bg-secondary) inset !important;
      }
      input:invalid,
      input:user-invalid {
        background-color: var(--bg-secondary) !important;
      }
      input[type="email"],
      input[type="password"],
      input[type="tel"] {
        background-color: var(--bg-secondary) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
    setPasswordRequirements(requirements);

    // Calculate strength score (0-5)
    const score = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(score);
  }, [formData.password]);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTherapistDataChange = (field, value) => {
    setTherapistData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.firstName) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName) newErrors.lastName = 'الاسم الأخير مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    
    // Password validation
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (formData.password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    else if (passwordStrength < 3) newErrors.password = 'كلمة المرور ضعيفة جداً';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    // Therapist-specific validation
    if (userType === 'therapist') {
      if (!therapistData.licenseNumber) newErrors.licenseNumber = 'رقم الترخيص مطلوب';
      if (!therapistData.specialty) newErrors.specialty = 'التخصص مطلوب';
      if (!therapistData.education) newErrors.education = 'المؤهل العلمي مطلوب';
    }

    // Gender validation
    if (!formData.gender) newErrors.gender = 'الجنس مطلوب';

    // Birth date validation
    if (!formData.birthDate) newErrors.birthDate = 'تاريخ الميلاد مطلوب';

    // Terms acceptance
    if (!acceptedTerms) newErrors.terms = 'يجب الموافقة على الشروط والأحكام';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        role: userType,
      };

      // Add therapist-specific data
      if (userType === 'therapist') {
        Object.assign(signupData, {
          licenseNumber: therapistData.licenseNumber,
          specialty: therapistData.specialty,
          yearsOfExperience: parseInt(therapistData.yearsOfExperience) || 0,
          education: therapistData.education,
          certifications: therapistData.certifications ? therapistData.certifications.split(',').map(s => s.trim()) : [],
          clinicAddress: therapistData.clinicAddress,
          city: therapistData.city,
          country: therapistData.country,
          bio: therapistData.bio,
          languages: therapistData.languages ? therapistData.languages.split(',').map(s => s.trim()) : ['ar'],
        });
      }

      const result = await register(signupData);

      if (result.success) {
        if (result.emailSent) {
          showError('البريد الإلكتروني مستخدم مسبقاً، يرجى استخدام بريد آخر أو تسجيل الدخول');
        } else {
          // Auto-verified & auto-logged in — go to home page
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } else {
        showError(result.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      
      showError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-gray-300';
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score) => {
    if (score === 0) return 'الرجاء إدخال كلمة المرور';
    if (score <= 2) return 'ضعيفة';
    if (score === 3) return 'متوسطة';
    if (score === 4) return 'جيدة';
    return 'قوية جداً';
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <AnimatedItem type="scale" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl mb-4">
                <i className="fas fa-user-plus text-white text-2xl"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary-color)] mb-2 sm:mb-4">انضم إلينا الآن!</h1>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">الرجاء إدخال بياناتك لإنشاء حساب جديد</p>
            </div>

            {/* Email Verification Notice */}
            <AnimatedItem type="slideUp" delay={0.15}>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">معلومة مهمة:</p>
                    <p className="text-xs">
                      بعد التسجيل، سيتم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من بريدك لتفعيل الحساب والبدء في استخدام المنصة.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            {/* User Type Selection */}
            <div className="text-right mb-6">
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-3">نوع الحساب</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('user')}
                  className={`px-6 py-4 rounded-xl border-2 font-medium transition-all flex flex-col items-center gap-2 ${
                    userType === 'user'
                      ? 'bg-[var(--accent-amber)] text-white border-[var(--accent-amber)] shadow-lg shadow-amber-500/30'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  <i className="fas fa-user text-2xl"></i>
                  <span>مستخدم عادي</span>
                  <span className="text-xs opacity-80">تصفح المحتوى واستخدم الأدوات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTherapistInfo(true)}
                  className={`px-6 py-4 rounded-xl border-2 font-medium transition-all flex flex-col items-center gap-2 relative ${
                    userType === 'therapist'
                      ? 'bg-[var(--accent-amber)] text-white border-[var(--accent-amber)] shadow-lg shadow-amber-500/30'
                      : 'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--primary-color)]/5 text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:shadow-lg'
                  }`}
                >
                  <i className="fas fa-user-md text-2xl"></i>
                  <span>معالج نفسي</span>
                  <span className="text-xs opacity-80">قدّم جلسات ودر ملفك المهني</span>
                  <span className="absolute top-2 left-2 px-2 py-1 bg-[var(--primary-color)] text-white text-xs rounded-full">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name Fields */}
              <AnimatedItem type="slideUp" delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-right">
                    <label htmlFor="firstName" className="block text-lg font-medium text-[var(--text-primary)] mb-3">الاسم الأول</label>
                    <div className="relative">
                      <input
                        ref={firstNameRef}
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="أدخل الاسم الأول"
                        className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.firstName ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm mt-1 text-right">{errors.firstName}</p>}
                  </div>

                  <div className="text-right">
                    <label htmlFor="lastName" className="block text-lg font-medium text-[var(--text-primary)] mb-3">اسم العائلة</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسم العائلة"
                        className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.lastName ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm mt-1 text-right">{errors.lastName}</p>}
                  </div>
                </div>
              </AnimatedItem>

              {/* Email */}
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="text-right">
                  <label htmlFor="email" className="block text-lg font-medium text-[var(--text-primary)] mb-3">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="أدخل البريد الإلكتروني"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.email ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-envelope"></i>
                    </div>
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1 text-right">{errors.email}</p>}
                </div>
              </AnimatedItem>

              {/* Password */}
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="text-right">
                  <label htmlFor="password" className="block text-lg font-medium text-[var(--text-primary)] mb-3">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="أدخل كلمة المرور"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.password ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-all duration-300"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1 text-right">{errors.password}</p>}
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-500' : 
                          passwordStrength === 3 ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordRequirements.length ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          <span>8 أحرف على الأقل</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordRequirements.uppercase ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          <span>حرف كبير</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordRequirements.lowercase ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          <span>حرف صغير</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordRequirements.number ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          <span>رقم</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordRequirements.special ? 'fa-check-circle' : 'fa-circle'}`}></i>
                          <span>رمز خاص</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedItem>

              {/* Confirm Password */}
              <AnimatedItem type="slideUp" delay={0.5}>
                <div className="text-right">
                  <label htmlFor="confirmPassword" className="block text-lg font-medium text-[var(--text-primary)] mb-3">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="أكد كلمة المرور"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.confirmPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-all duration-300"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 text-right">{errors.confirmPassword}</p>}
                </div>
              </AnimatedItem>

              {/* Phone */}
              <AnimatedItem type="slideUp" delay={0.6}>
                <div className="text-right">
                  <label htmlFor="phone" className="block text-lg font-medium text-[var(--text-primary)] mb-3">رقم الهاتف</label>
                  <div className="flex gap-2">
                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="٥X XXX XXXX"
                        className={`w-full px-4 py-4 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.phone ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                    </div>

                    {/* Country Code Dropdown */}
                    <div className="relative w-32 flex-shrink-0">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] appearance-none cursor-pointer font-medium text-sm"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      >
                        {countryCodes.map((country) => (
                          <option 
                            key={country.code} 
                            value={country.code}
                            className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                          >
                            {country.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
                        <i className="fas fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1 text-right">{errors.phone}</p>}
                </div>
              </AnimatedItem>

              {/* Birth Date */}
              <AnimatedItem type="slideUp" delay={0.7}>
                <div className="text-right">
                  <label htmlFor="birthDate" className="block text-lg font-medium text-[var(--text-primary)] mb-3">تاريخ الميلاد</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.birthDate ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                  </div>
                  {errors.birthDate && <p className="text-red-500 text-sm mt-1 text-right">{errors.birthDate}</p>}
                </div>
              </AnimatedItem>

              {/* Gender */}
              <AnimatedItem type="slideUp" delay={0.8}>
                <div className="text-right">
                  <label className="block text-lg font-medium text-[var(--text-primary)] mb-3">الجنس</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'gender', value: 'male' } })}
                      className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-300 flex items-center justify-center ${
                        formData.gender === 'male'
                          ? 'bg-[var(--accent-amber)] text-white border-[var(--accent-amber)]'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      <i className="fas fa-male ml-2"></i>
                      <span>ذكر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'gender', value: 'female' } })}
                      className={`px-6 py-4 rounded-xl border-2 font-medium transition-all duration-300 flex items-center justify-center ${
                        formData.gender === 'female'
                          ? 'bg-[var(--accent-amber)] text-white border-[var(--accent-amber)]'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      <i className="fas fa-female ml-2"></i>
                      <span>أنثى</span>
                    </button>
                  </div>
                  {errors.gender && <p className="text-red-500 text-sm mt-1 text-right">{errors.gender}</p>}
                </div>
              </AnimatedItem>

              {/* Therapist Fields */}
              {userType === 'therapist' && (
                <AnimatedItem type="slideUp" delay={0.9}>
                  <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
                    <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6 text-right flex items-center gap-3">
                      <i className="fas fa-briefcase-medical"></i>
                      بيانات المعالج
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* License Number */}
                      <div className="text-right">
                        <label htmlFor="licenseNumber" className="block text-lg font-medium text-[var(--text-primary)] mb-3">رقم الترخيص المهني</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="licenseNumber"
                            name="licenseNumber"
                            value={therapistData.licenseNumber}
                            onChange={(e) => handleTherapistDataChange('licenseNumber', e.target.value)}
                            placeholder="أدخل رقم الترخيص المهني"
                            className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.licenseNumber ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                            <i className="fas fa-id-card"></i>
                          </div>
                        </div>
                        {errors.licenseNumber && <p className="text-red-500 text-sm mt-1 text-right">{errors.licenseNumber}</p>}
                      </div>

                      {/* Specialty */}
                      <div className="text-right">
                        <label htmlFor="specialty" className="block text-lg font-medium text-[var(--text-primary)] mb-3">التخصص</label>
                        <div className="relative">
                          <select
                            id="specialty"
                            name="specialty"
                            value={therapistData.specialty}
                            onChange={(e) => handleTherapistDataChange('specialty', e.target.value)}
                            className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] appearance-none ${errors.specialty ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                          >
                            <option value="" disabled>اختر تخصصك</option>
                            <option value="العلاج السلوكي المعرفي">العلاج السلوكي المعرفي</option>
                            <option value="العلاج النفسي الديناميكي">العلاج النفسي الديناميكي</option>
                            <option value="العلاج الزواجي والأسري">العلاج الزواجي والأسري</option>
                            <option value="العلاج الجماعي">العلاج الجماعي</option>
                            <option value="الإدمان والتعافي">الإدمان والتعافي</option>
                            <option value="الصحة النفسية للأطفال والمراهقين">الصحة النفسية للأطفال والمراهقين</option>
                            <option value="الصدمات النفسية">الصدمات النفسية</option>
                            <option value="القلق والاكتئاب">القلق والاكتئاب</option>
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
                            <i className="fas fa-chevron-down"></i>
                          </div>
                        </div>
                        {errors.specialty && <p className="text-red-500 text-sm mt-1 text-right">{errors.specialty}</p>}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="text-right">
                      <label htmlFor="education" className="block text-lg font-medium text-[var(--text-primary)] mb-3">المؤهل العلمي</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="education"
                          name="education"
                          value={therapistData.education}
                          onChange={(e) => handleTherapistDataChange('education', e.target.value)}
                          placeholder="دكتوراه في علم النفس، جامعة..."
                          className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.education ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                      </div>
                      {errors.education && <p className="text-red-500 text-sm mt-1 text-right">{errors.education}</p>}
                    </div>

                    {/* Years of Experience */}
                    <div className="text-right">
                      <label htmlFor="yearsOfExperience" className="block text-lg font-medium text-[var(--text-primary)] mb-3">سنوات الخبرة</label>
                      <div className="relative">
                        <input
                          type="number"
                          id="yearsOfExperience"
                          name="yearsOfExperience"
                          value={therapistData.yearsOfExperience}
                          onChange={(e) => handleTherapistDataChange('yearsOfExperience', e.target.value)}
                          placeholder="عدد السنوات"
                          min="0"
                          max="50"
                          className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-clock"></i>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="text-right">
                      <label htmlFor="certifications" className="block text-lg font-medium text-[var(--text-primary)] mb-3">الشهادات (اختياري)</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="certifications"
                          name="certifications"
                          value={therapistData.certifications}
                          onChange={(e) => handleTherapistDataChange('certifications', e.target.value)}
                          placeholder="شهادة العلاج المعرفي، شهادة التحليل النفسي..."
                          className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-award"></i>
                        </div>
                      </div>
                    </div>

                    {/* Clinic Address */}
                    <div className="text-right">
                      <label htmlFor="clinicAddress" className="block text-lg font-medium text-[var(--text-primary)] mb-3">عنوان العيادة (اختياري)</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="clinicAddress"
                          name="clinicAddress"
                          value={therapistData.clinicAddress}
                          onChange={(e) => handleTherapistDataChange('clinicAddress', e.target.value)}
                          placeholder="المدينة، الشارع..."
                          className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                      </div>
                    </div>

                    {/* City & Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-right">
                        <label htmlFor="city" className="block text-lg font-medium text-[var(--text-primary)] mb-3">المدينة</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={therapistData.city}
                            onChange={(e) => handleTherapistDataChange('city', e.target.value)}
                            placeholder="القاهرة، الرياض..."
                            className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                            <i className="fas fa-city"></i>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <label htmlFor="country" className="block text-lg font-medium text-[var(--text-primary)] mb-3">البلد</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={therapistData.country}
                            onChange={(e) => handleTherapistDataChange('country', e.target.value)}
                            placeholder="مصر، السعودية..."
                            className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                            <i className="fas fa-globe"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="text-right">
                      <label htmlFor="bio" className="block text-lg font-medium text-[var(--text-primary)] mb-3">نبذة تعريفية (اختياري)</label>
                      <div className="relative">
                        <textarea
                          id="bio"
                          name="bio"
                          value={therapistData.bio}
                          onChange={(e) => handleTherapistDataChange('bio', e.target.value)}
                          placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
                          rows={3}
                          className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] resize-none"
                        />
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="text-right">
                      <label htmlFor="languages" className="block text-lg font-medium text-[var(--text-primary)] mb-3">اللغات (اختياري)</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="languages"
                          name="languages"
                          value={therapistData.languages}
                          onChange={(e) => handleTherapistDataChange('languages', e.target.value)}
                          placeholder="العربية، الإنجليزية..."
                          className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-language"></i>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">افصل بين اللغات بفاصلة</p>
                    </div>
                  </div>
                </AnimatedItem>
              )}

              {/* Terms & Privacy Checkbox (Always at bottom) */}
              <AnimatedItem type="slideUp" delay={userType === 'therapist' ? 1.0 : 0.9}>
                <div className="text-right">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 text-[var(--accent-amber)] border-2 border-[var(--border-color)] rounded focus:ring-[var(--accent-amber)] focus:ring-offset-0 mt-1"
                    />
                    <span className="text-[var(--text-primary)] text-sm">
                      أوافق على{' '}
                      <Link to="/terms" className="text-[var(--accent-amber)] hover:underline" target="_blank">
                        الشروط والأحكام
                      </Link>
                      {' '}و{' '}
                      <Link to="/privacy" className="text-[var(--accent-amber)] hover:underline" target="_blank">
                        سياسة الخصوصية
                      </Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-sm mt-1 text-right">{errors.terms}</p>}
                </div>
              </AnimatedItem>

              {/* Submit Button */}
              <AnimatedItem type="slideUp" delay={userType === 'therapist' ? 1.1 : 1.0}>
                <button
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  className={`w-full py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || !acceptedTerms ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus text-white"></i>
                      {userType === 'therapist' ? 'تسجيل معالج' : 'إنشاء حساب'}
                    </>
                  )}
                </button>
              </AnimatedItem>
            </form>

            {/* Therapist Info Modal */}
            {showTherapistInfo && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTherapistInfo(false)}>
                <div className="bg-[var(--card-bg)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <i className="fas fa-user-md text-2xl"></i>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">حساب المعالج النفسي</h2>
                          <p className="text-sm opacity-90">انضم إلى مجتمعنا من المختصين</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowTherapistInfo(false)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Benefits */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <i className="fas fa-gift text-[var(--primary-color)]"></i>
                        مزايا حساب المعالج
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { icon: 'fa-user-shield', text: 'ملف مهني معروض في المنصة' },
                          { icon: 'fa-users', text: 'وصول لآلاف المستخدمين' },
                          { icon: 'fa-map-marker-alt', text: 'عرض موقعك وتفاصيل العيادة' },
                          { icon: 'fa-shield-alt', text: 'علامة موثوق بعد التحقق' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <i className={`fas ${item.icon} text-[var(--primary-color)]`}></i>
                            <span className="text-sm">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <i className="fas fa-clipboard-check text-[var(--primary-color)]"></i>
                        المتطلبات
                      </h3>
                      <div className="space-y-2">
                        {[
                          'رقم ترخيص مزاولة المهنة',
                          'مؤهل علمي معتمد في علم النفس أو الطب النفسي',
                          'مدينتك وتفاصيل عيادتك',
                          'التحقق من البريد الإلكتروني',
                          'علامة موثوق بعد المراجعة',
                        ].map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Process Steps */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <i className="fas fa-list-ol text-[var(--primary-color)]"></i>
                        خطوات التسجيل
                      </h3>
                      <div className="space-y-3">
                        {[
                          { num: 1, title: 'إنشاء الحساب', desc: 'أدخل معلوماتك الأساسية والتخصص والمدينة' },
                          { num: 2, title: 'التحقق من البريد', desc: 'أكد بريدك الإلكتروني عبر الرابط المرسل' },
                          { num: 3, title: 'البدء!', desc: 'يمكنك استخدام المنصة فوراً' },
                          { num: 4, title: 'مراجعة الإدارة', desc: 'تحصل على علامة موثوق بعد التحقق' },
                        ].map((step) => (
                          <div key={step.num} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {step.num}
                            </div>
                            <div>
                              <div className="font-medium text-[var(--text-primary)] text-sm">{step.title}</div>
                              <div className="text-xs text-[var(--text-secondary)]">{step.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Important Note */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-info-circle text-amber-500 text-xl mt-0.5"></i>
                        <div>
                          <p className="text-sm font-medium text-amber-700 mb-1">ملاحظة مهمة</p>
                          <p className="text-xs text-amber-600">
                            بعد تسجيل الحساب والتحقق من بريدك الإلكتروني، يمكنك استخدام المنصة فوراً. رقم ترخيصك ومدينة العمل يتم مراجعتها من قِبل الإدارة للحصول على علامة "موثوق". عملية المراجعة تستغرق ٢-٥ أيام عمل.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-[var(--border-color)] flex gap-3">
                    <button
                      onClick={() => setShowTherapistInfo(false)}
                      className="flex-1 px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-xl font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        setUserType('therapist');
                        setShowTherapistInfo(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <i className="fas fa-check ml-2"></i>
                      متابعة كمعالج
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-[var(--text-secondary)]">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-[var(--accent-amber)] font-medium hover:text-[var(--accent-amber)]/80 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default SignupPage;
