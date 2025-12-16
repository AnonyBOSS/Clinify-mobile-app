export const ar = {
    // Common
    common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        retry: 'إعادة المحاولة',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        back: 'رجوع',
        next: 'التالي',
        done: 'تم',
        search: 'بحث',
        noResults: 'لا توجد نتائج',
        seeAll: 'عرض الكل',
    },

    // Auth
    auth: {
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        fullName: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        forgotPassword: 'نسيت كلمة المرور؟',
        noAccount: 'ليس لديك حساب؟',
        hasAccount: 'لديك حساب بالفعل؟',
        signUp: 'إنشاء حساب',
        signIn: 'دخول',
        asPatient: 'كمريض',
        asDoctor: 'كطبيب',
        loginSuccess: 'تم تسجيل الدخول بنجاح!',
        registerSuccess: 'تم إنشاء الحساب بنجاح!',
        invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
        emailRequired: 'البريد الإلكتروني مطلوب',
        passwordRequired: 'كلمة المرور مطلوبة',
        passwordMismatch: 'كلمات المرور غير متطابقة',
    },

    // Navigation
    nav: {
        dashboard: 'الرئيسية',
        search: 'بحث',
        messages: 'الرسائل',
        notifications: 'الإشعارات',
        profile: 'الملف الشخصي',
        schedule: 'الجدول',
    },

    // Dashboard
    dashboard: {
        welcome: 'مرحباً',
        todayAppointments: 'مواعيد اليوم',
        upcomingAppointments: 'المواعيد القادمة',
        pastAppointments: 'المواعيد السابقة',
        noAppointments: 'لا توجد مواعيد',
        bookAppointment: 'حجز موعد',
        symptomChecker: 'فحص الأعراض',
        aiAssistant: 'المساعد الذكي',
        viewAll: 'عرض الكل',
    },

    // Appointments
    appointments: {
        book: 'حجز موعد',
        cancel: 'إلغاء الموعد',
        reschedule: 'إعادة الجدولة',
        details: 'تفاصيل الموعد',
        status: {
            booked: 'محجوز',
            confirmed: 'مؤكد',
            cancelled: 'ملغي',
            completed: 'مكتمل',
        },
        selectDate: 'اختر التاريخ',
        selectTime: 'اختر الوقت',
        availableSlots: 'المواعيد المتاحة',
        noSlots: 'لا توجد مواعيد متاحة لهذا التاريخ',
        notes: 'ملاحظات (اختياري)',
        payment: 'الدفع',
        paymentMethod: 'طريقة الدفع',
        cash: 'نقداً',
        card: 'بطاقة',
        confirmBooking: 'تأكيد الحجز',
        bookingSuccess: 'تم حجز الموعد بنجاح!',
        cancelSuccess: 'تم إلغاء الموعد بنجاح',
        cancelConfirm: 'هل أنت متأكد من إلغاء هذا الموعد؟',
    },

    // Doctors
    doctors: {
        searchDoctors: 'البحث عن أطباء',
        specialization: 'التخصص',
        allSpecializations: 'جميع التخصصات',
        consultationFee: 'رسوم الاستشارة',
        rating: 'التقييم',
        reviews: 'تقييمات',
        noReviews: 'لا توجد تقييمات بعد',
        bookWith: 'احجز مع',
        viewProfile: 'عرض الملف',
        qualifications: 'المؤهلات',
        experience: 'الخبرة',
        about: 'نبذة',
    },

    // Messages
    messages: {
        title: 'الرسائل',
        newMessage: 'رسالة جديدة',
        typeMessage: 'اكتب رسالة...',
        send: 'إرسال',
        noMessages: 'لا توجد رسائل بعد',
        noConversations: 'لا توجد محادثات بعد',
        startConversation: 'ابدأ محادثة مع طبيبك',
    },

    // Notifications
    notifications: {
        title: 'الإشعارات',
        markAllRead: 'تحديد الكل كمقروء',
        noNotifications: 'لا توجد إشعارات',
        appointment: 'موعد',
        message: 'رسالة',
        rating: 'تقييم',
    },

    // Profile
    profile: {
        title: 'الملف الشخصي',
        editProfile: 'تعديل الملف',
        personalInfo: 'المعلومات الشخصية',
        changePassword: 'تغيير كلمة المرور',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        insurance: 'معلومات التأمين',
        insuranceProvider: 'شركة التأمين',
        policyNumber: 'رقم الوثيقة',
        medicalSummary: 'الملخص الطبي',
        emergencyContact: 'جهة اتصال الطوارئ',
        qualifications: 'المؤهلات',
        specializations: 'التخصصات',
        consultationFee: 'رسوم الاستشارة',
        settings: 'الإعدادات',
        language: 'اللغة',
        darkMode: 'الوضع الداكن',
        updateSuccess: 'تم تحديث الملف بنجاح',
        passwordSuccess: 'تم تغيير كلمة المرور بنجاح',
    },

    // Schedule (Doctor)
    schedule: {
        title: 'إدارة الجدول',
        workingDays: 'أيام العمل',
        addSchedule: 'إضافة جدول',
        editSchedule: 'تعديل الجدول',
        dayOfWeek: 'اليوم',
        startTime: 'وقت البداية',
        endTime: 'وقت النهاية',
        slotDuration: 'مدة الموعد (دقائق)',
        clinic: 'العيادة',
        room: 'الغرفة',
        generateSlots: 'إنشاء المواعيد',
        slotsGenerated: 'تم إنشاء المواعيد بنجاح',
        noSchedule: 'لا يوجد جدول محدد',
        days: {
            sunday: 'الأحد',
            monday: 'الاثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة',
            saturday: 'السبت',
        },
    },

    // Ratings
    ratings: {
        rateDoctor: 'تقييم الطبيب',
        yourRating: 'تقييمك',
        writeReview: 'اكتب تقييماً (اختياري)',
        submitRating: 'إرسال التقييم',
        ratingSuccess: 'تم إرسال التقييم بنجاح',
        thankYou: 'شكراً لملاحظاتك!',
    },

    // AI Features
    ai: {
        symptomChecker: 'فحص الأعراض',
        describeSymptoms: 'صف أعراضك',
        analyzeSymptoms: 'تحليل الأعراض',
        analyzing: 'جاري تحليل الأعراض...',
        results: 'نتائج التحليل',
        recommendations: 'التوصيات',
        suggestedSpecialists: 'الأطباء المقترحون',
        urgency: 'مستوى الاستعجال',
        medicalAssistant: 'المساعد الطبي الذكي',
        askQuestion: 'اسأل سؤالاً صحياً...',
        disclaimer: 'هذا المساعد الذكي يوفر معلومات صحية عامة فقط. استشر دائماً أخصائي رعاية صحية للحصول على نصيحة طبية.',
    },

    // Errors
    errors: {
        networkError: 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
        serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
        unauthorized: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
        notFound: 'المورد غير موجود.',
        validationError: 'يرجى التحقق من البيانات المدخلة.',
    },
};
