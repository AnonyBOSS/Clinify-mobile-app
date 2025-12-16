export const en = {
    // Common
    common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        done: 'Done',
        search: 'Search',
        noResults: 'No results found',
        seeAll: 'See All',
    },

    // Auth
    auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        fullName: 'Full Name',
        phone: 'Phone Number',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        signUp: 'Sign Up',
        signIn: 'Sign In',
        asPatient: 'As Patient',
        asDoctor: 'As Doctor',
        loginSuccess: 'Login successful!',
        registerSuccess: 'Registration successful!',
        invalidCredentials: 'Invalid email or password',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        passwordMismatch: 'Passwords do not match',
    },

    // Navigation
    nav: {
        dashboard: 'Dashboard',
        search: 'Search',
        messages: 'Messages',
        notifications: 'Notifications',
        profile: 'Profile',
        schedule: 'Schedule',
    },

    // Dashboard
    dashboard: {
        welcome: 'Welcome',
        todayAppointments: "Today's Appointments",
        upcomingAppointments: 'Upcoming Appointments',
        pastAppointments: 'Past Appointments',
        noAppointments: 'No appointments',
        bookAppointment: 'Book Appointment',
        symptomChecker: 'Symptom Checker',
        aiAssistant: 'AI Assistant',
        viewAll: 'View All',
    },

    // Appointments
    appointments: {
        book: 'Book Appointment',
        cancel: 'Cancel Appointment',
        reschedule: 'Reschedule',
        details: 'Appointment Details',
        status: {
            booked: 'Booked',
            confirmed: 'Confirmed',
            cancelled: 'Cancelled',
            completed: 'Completed',
        },
        selectDate: 'Select Date',
        selectTime: 'Select Time Slot',
        availableSlots: 'Available Slots',
        noSlots: 'No available slots for this date',
        notes: 'Notes (optional)',
        payment: 'Payment',
        paymentMethod: 'Payment Method',
        cash: 'Cash',
        card: 'Card',
        confirmBooking: 'Confirm Booking',
        bookingSuccess: 'Appointment booked successfully!',
        cancelSuccess: 'Appointment cancelled successfully',
        cancelConfirm: 'Are you sure you want to cancel this appointment?',
    },

    // Doctors
    doctors: {
        searchDoctors: 'Search Doctors',
        specialization: 'Specialization',
        allSpecializations: 'All Specializations',
        consultationFee: 'Consultation Fee',
        rating: 'Rating',
        reviews: 'reviews',
        noReviews: 'No reviews yet',
        bookWith: 'Book with',
        viewProfile: 'View Profile',
        qualifications: 'Qualifications',
        experience: 'Experience',
        about: 'About',
    },

    // Messages
    messages: {
        title: 'Messages',
        newMessage: 'New Message',
        typeMessage: 'Type a message...',
        send: 'Send',
        noMessages: 'No messages yet',
        noConversations: 'No conversations yet',
        startConversation: 'Start a conversation with your doctor',
    },

    // Notifications
    notifications: {
        title: 'Notifications',
        markAllRead: 'Mark all as read',
        noNotifications: 'No notifications',
        appointment: 'Appointment',
        message: 'Message',
        rating: 'Rating',
    },

    // Profile
    profile: {
        title: 'Profile',
        editProfile: 'Edit Profile',
        personalInfo: 'Personal Information',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        insurance: 'Insurance Information',
        insuranceProvider: 'Insurance Provider',
        policyNumber: 'Policy Number',
        medicalSummary: 'Medical Summary',
        emergencyContact: 'Emergency Contact',
        qualifications: 'Qualifications',
        specializations: 'Specializations',
        consultationFee: 'Consultation Fee',
        settings: 'Settings',
        language: 'Language',
        darkMode: 'Dark Mode',
        updateSuccess: 'Profile updated successfully',
        passwordSuccess: 'Password changed successfully',
    },

    // Schedule (Doctor)
    schedule: {
        title: 'Schedule Management',
        workingDays: 'Working Days',
        addSchedule: 'Add Schedule',
        editSchedule: 'Edit Schedule',
        dayOfWeek: 'Day of Week',
        startTime: 'Start Time',
        endTime: 'End Time',
        slotDuration: 'Slot Duration (minutes)',
        clinic: 'Clinic',
        room: 'Room',
        generateSlots: 'Generate Slots',
        slotsGenerated: 'Slots generated successfully',
        noSchedule: 'No schedule configured',
        days: {
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
        },
    },

    // Ratings
    ratings: {
        rateDoctor: 'Rate Doctor',
        yourRating: 'Your Rating',
        writeReview: 'Write a review (optional)',
        submitRating: 'Submit Rating',
        ratingSuccess: 'Rating submitted successfully',
        thankYou: 'Thank you for your feedback!',
    },

    // AI Features
    ai: {
        symptomChecker: 'Symptom Checker',
        describeSymptoms: 'Describe your symptoms',
        analyzeSymptoms: 'Analyze Symptoms',
        analyzing: 'Analyzing your symptoms...',
        results: 'Analysis Results',
        recommendations: 'Recommendations',
        suggestedSpecialists: 'Suggested Specialists',
        urgency: 'Urgency Level',
        medicalAssistant: 'AI Medical Assistant',
        askQuestion: 'Ask a health question...',
        disclaimer: 'This AI assistant provides general health information only. Always consult a healthcare professional for medical advice.',
    },

    // Errors
    errors: {
        networkError: 'Network error. Please check your connection.',
        serverError: 'Server error. Please try again later.',
        unauthorized: 'Session expired. Please login again.',
        notFound: 'Resource not found.',
        validationError: 'Please check your input.',
    },
};

export type TranslationKeys = typeof en;
