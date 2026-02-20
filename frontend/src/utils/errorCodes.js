// errorCodes.js - Error code to Arabic message mapping
export const ERROR_CODE_MESSAGES = {
  // Authentication errors
  'INVALID_CREDENTIALS': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'EMAIL_EXISTS': 'البريد الإلكتروني مستخدم مسبقاً',
  'ACCOUNT_NOT_FOUND': 'الحساب غير موجود',
  'UNAUTHORIZED_ACCESS': 'غير مصرح بالوصول، يرجى تسجيل الدخول',
  'TOKEN_EXPIRED': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا',
  'TOKEN_INVALID': 'التوكن غير صحيح، يرجى تسجيل الدخول مجددًا',

  // Account state errors
  'EMAIL_NOT_VERIFIED': 'لم يتم التحقق من بريدك الإلكتروني. يرجى التحقق من بريدك أو طلب رابط تحقق جديد',
  'ACCOUNT_DEACTIVATED': 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني للمساعدة',
  'PASSWORD_EXPIRED': 'انتهت صلاحية كلمة المرور. يرجى تغيير كلمة المرور',
  'ACCOUNT_PENDING_APPROVAL': 'حسابك قيد المراجعة من قبل فريقنا. ستتمكن من تسجيل الدخول بعد الموافقة. ستتلقى إشعاراً عبر البريد الإلكتروني عند الموافقة',

  // Validation errors
  'VALIDATION_ERROR': 'البيانات المدخلة غير صحيحة، يرجى التحقق من المعلومات المقدمة',
  'MISSING_REQUIRED_FIELD': 'الرجاء ملء جميع الحقول المطلوبة',

  // General errors
  'INTERNAL_ERROR': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
  'BAD_REQUEST': 'طلب غير صحيح، يرجى التحقق من البيانات المقدمة',
  'UNAUTHORIZED': 'غير مصرح بالوصول، يرجى تسجيل الدخول',
  'FORBIDDEN': 'غير مصرح بالوصول، الصلاحيات غير كافية',
  'NOT_FOUND': 'الصفحة أو المورد المطلوب غير موجود',
  'CONFLICT': 'تعارض في البيانات، يرجى التحقق من المعلومات المقدمة',
  'UNPROCESSABLE_ENTITY': 'البيانات المدخلة غير صحيحة، يرجى التحقق من تنسيق البيانات',

  // User-related errors
  'USER_NOT_FOUND': 'المستخدم غير موجود',
  'USER_ALREADY_EXISTS': 'المستخدم موجود مسبقاً',

  // Resource errors
  'RESOURCE_NOT_FOUND': 'الموارد المطلوبة غير موجودة',
  'INSUFFICIENT_PERMISSIONS': 'صلاحيات غير كافية للوصول إلى هذا المورد',

  // Default fallback
  'DEFAULT_ERROR': 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً'
};

// Function to get user-friendly message from error code
export const getUserFriendlyMessage = (errorCode) => {
  return ERROR_CODE_MESSAGES[errorCode] || ERROR_CODE_MESSAGES['DEFAULT_ERROR'];
};