// User types
export type UserRole = 'patient' | 'doctor';

export interface User {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface Patient extends User {
    role: 'patient';
    insurance?: {
        provider: string;
        policyNumber: string;
    };
    medical_summary?: string;
    emergency_contact?: {
        name: string;
        phone: string;
        relationship: string;
    };
}

export interface Doctor extends User {
    role: 'doctor';
    qualifications: string;
    specializations: string[];
    clinic_affiliations: string[];
    schedule_days: ScheduleDay[];
    consultation_fee: number;
    average_rating?: number;
    total_ratings?: number;
}

export interface ScheduleDay {
    dayOfWeek: number;
    clinic: string;
    room: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
}

// Clinic & Slot types
export interface Clinic {
    id: string;
    name: string;
    phone: string;
    operating_hours: string;
    address: {
        street: string;
        city: string;
        governorate: string;
    };
}

export interface Room {
    id: string;
    clinic: string;
    room_number: string;
    type: string;
    status: 'AVAILABLE' | 'MAINTENANCE';
}

export interface Slot {
    id: string;
    doctor: string;
    clinic: string;
    room: string;
    date: string;
    time: string;
    status: 'AVAILABLE' | 'BOOKED';
}

// Appointment types
export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Payment {
    amount: number;
    method: 'cash' | 'card';
    transaction_id?: string;
    status: 'pending' | 'completed' | 'refunded';
    timestamp: string;
}

export interface Appointment {
    id: string;
    patient: Patient | string;
    doctor: Doctor | string;
    clinic: Clinic | string;
    room: Room | string;
    slot: Slot | string;
    status: AppointmentStatus;
    notes?: string;
    payment?: Payment;
    createdAt: string;
    updatedAt: string;
}

// Message types
export interface Message {
    id: string;
    sender: string;
    senderRole: UserRole;
    recipient: string;
    recipientRole: UserRole;
    content: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    userId: string;
    userType: 'DOCTOR' | 'PATIENT';
    userName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

// Notification types - includes both frontend and backend type names
export type NotificationType = 'appointment' | 'message' | 'rating' | 'system' | 'NEW_MESSAGE' | 'APPOINTMENT' | 'RATING';

export interface Notification {
    id: string;
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: string;
}

// Rating types
export interface Rating {
    id: string;
    patient: string;
    doctor: string;
    appointment: string;
    rating: number;
    review?: string;
    createdAt: string;
}

// AI types
export interface SymptomCheckResult {
    urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    detailedAnalysis: string;
    possibleConditions: string[];
    suggestedSpecialties: string[];
    selfCareAdvice: string[];
    warningSignsToWatch: string[];
    followUpQuestions: string[];
}

export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
    role: UserRole;
}

export interface RegisterData {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    // Patient specific
    insurance?: {
        provider: string;
        policyNumber: string;
    };
    medical_summary?: string;
    // Doctor specific
    qualifications?: string;
    specializations?: string[];
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        user: User;
        token: string;
    };
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Navigation types
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type PatientTabParamList = {
    Dashboard: undefined;
    Search: undefined;
    Messages: undefined;
    Notifications: undefined;
    Profile: undefined;
};

export type DoctorTabParamList = {
    Dashboard: undefined;
    Schedule: undefined;
    Messages: undefined;
    Notifications: undefined;
    Profile: undefined;
};

export type SharedStackParamList = {
    Chat: { recipientId: string; recipientName: string };
    Booking: { doctorId: string; doctorName: string };
    SymptomChecker: undefined;
    AIAssistant: undefined;
    DoctorDetails: { doctorId: string };
    AppointmentDetails: { appointmentId: string };
    RateDoctor: { appointmentId: string; doctorId: string; doctorName: string };
};
