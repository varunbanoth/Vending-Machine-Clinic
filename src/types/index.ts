export type Language = 'en' | 'te';

export type UserRole = 'customer' | 'admin' | 'doctor';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  healthScore?: number;
  gender?: string;
  age?: number;
  bloodGroup?: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'sample_collected' | 'analyzing' | 'completed' | 'cancelled';

export interface PaymentDetails {
  amount: number;
  method: 'UPI' | 'Card' | 'Cash' | 'HealthWallet';
  status: 'success' | 'pending' | 'failed';
  transactionId: string;
  upiApp?: string;
  paidAt: string;
}

export interface Booking {
  id?: string;
  bookingId: string;
  userId: string;
  userName: string;
  userPhone: string;
  testType: string;
  status: BookingStatus;
  kiosk: string;
  payment: PaymentDetails;
  createdAt: string;
  scheduledTime?: string;
  notes?: string;
}

export interface BiomarkerItem {
  name: string;
  nameTe?: string;
  value: string;
  numericValue?: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
}

export interface Report {
  id?: string;
  reportId: string;
  bookingId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  testType: string;
  glucose?: string;
  cholesterol?: string;
  cbc?: string;
  thyroid?: string;
  summary: string;
  summaryTe: string;
  advice?: string;
  biomarkers?: BiomarkerItem[];
  pdfUrl?: string;
  status: 'verified' | 'pending_review' | 'flagged';
  doctorNotes?: string;
  doctorName?: string;
  kioskLocation?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id?: string;
  paymentId: string;
  bookingId: string;
  userId: string;
  userName?: string;
  amount: number;
  method: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  titleTe?: string;
  message: string;
  messageTe?: string;
  type: 'report_ready' | 'appointment' | 'medication' | 'system' | 'emergency';
  read: boolean;
  createdAt: string;
}

export interface TestPackage {
  id: string;
  name: string;
  nameTe: string;
  price: number;
  duration: string;
  durationTe: string;
  description: string;
  descriptionTe: string;
  iconName: 'Droplet' | 'Activity' | 'Heart' | 'Zap';
  parameters: string[];
  parametersTe: string[];
  normalRangeText: string;
  typicalUnits: string;
  fastingRequired: boolean;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  takenToday: boolean;
}

export interface KioskHardwareStatus {
  id: string;
  name: string;
  city: string;
  location: string;
  status: 'online' | 'maintenance' | 'offline';
  reagentsLevel: number; // percentage
  lancetsRemaining: number;
  tempCelsius: number;
  testsToday: number;
  lastPing: string;
}
