import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  UserProfile,
  Booking,
  Report,
  PaymentRecord,
  AppNotification,
  BookingStatus,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- USERS -----------------

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ----------------- BOOKINGS -----------------

export async function createBooking(booking: Booking): Promise<string> {
  const path = `bookings/${booking.bookingId}`;
  try {
    await setDoc(doc(db, 'bookings', booking.bookingId), booking);
    return booking.bookingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  const path = 'bookings';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  const path = 'bookings';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToBookings(
  callback: (bookings: Booking[]) => void,
  userId?: string
) {
  const path = 'bookings';
  const q = userId
    ? query(collection(db, path), where('userId', '==', userId))
    : query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------- REPORTS -----------------

export async function saveReport(report: Report): Promise<string> {
  const path = `reports/${report.reportId}`;
  try {
    await setDoc(doc(db, 'reports', report.reportId), report);
    return report.reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReportDoctorNotes(
  reportId: string,
  doctorNotes: string,
  doctorName: string,
  status: 'verified' | 'pending_review' | 'flagged' = 'verified'
): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      doctorNotes,
      doctorName,
      status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getReportsByUser(userId: string): Promise<Report[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Report));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllReports(): Promise<Report[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Report));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToReports(
  callback: (reports: Report[]) => void,
  userId?: string
) {
  const path = 'reports';
  const q = userId
    ? query(collection(db, path), where('userId', '==', userId))
    : query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Report));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ----------------- PAYMENTS -----------------

export async function savePayment(payment: PaymentRecord): Promise<string> {
  const path = `payments/${payment.paymentId}`;
  try {
    await setDoc(doc(db, 'payments', payment.paymentId), payment);
    return payment.paymentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const path = 'payments';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as PaymentRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ----------------- NOTIFICATIONS -----------------

export async function createNotification(notification: AppNotification): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getNotificationsByUser(userId: string): Promise<AppNotification[]> {
  const path = 'notifications';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppNotification);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ----------------- SEED INITIAL REALISTIC DATA -----------------

export async function seedInitialDemoData() {
  try {
    // Check if initial reports exist
    const existing = await getDocs(query(collection(db, 'reports'), limit(1)));
    if (!existing.empty) {
      return; // Already populated
    }

    const demoUserId = 'guest_demo_user_01';
    const now = new Date();

    // 1. Seed demo user
    await setDoc(doc(db, 'users', demoUserId), {
      uid: demoUserId,
      name: 'Ravi Teja Kumar',
      phone: '+91 98765 43210',
      role: 'customer',
      email: 'ravi.kumar@example.com',
      healthScore: 84,
      gender: 'Male',
      age: 38,
      bloodGroup: 'O+',
      createdAt: now.toISOString(),
    });

    // 2. Seed initial reports
    const report1: Report = {
      reportId: 'VMC-REP-8041',
      bookingId: 'VMC-BK-1021',
      userId: demoUserId,
      userName: 'Ravi Teja Kumar',
      userPhone: '+91 98765 43210',
      testType: 'Blood Sugar',
      glucose: '138 mg/dL',
      summary: 'Your fasting glucose is slightly elevated at 138 mg/dL. Drink more water, reduce refined sugars, and follow up in 2 weeks.',
      summaryTe: 'మీ రక్తంలో గ్లూకోజ్ స్థాయి 138 mg/dL తో కొద్దిగా ఎక్కువగా ఉంది. పుష్కలంగా నీరు త్రాగండి, చక్కెర వినియోగాన్ని తగ్గించండి మరియు 2 వారాలలో మళ్లీ పరీక్షించండి.',
      advice: 'Avoid sugary drinks, walk 30 minutes daily, stay hydrated.',
      biomarkers: [
        {
          name: 'Fasting Blood Glucose',
          nameTe: 'ఉపవాస రక్త గ్లూకోజ్',
          value: '138',
          numericValue: 138,
          unit: 'mg/dL',
          normalRange: '70 - 99 mg/dL',
          status: 'high',
        },
        {
          name: 'HbA1c Equivalent Est.',
          nameTe: 'HbA1c అంచనా',
          value: '6.4',
          numericValue: 6.4,
          unit: '%',
          normalRange: '< 5.7 %',
          status: 'high',
        },
      ],
      pdfUrl: '#',
      status: 'verified',
      doctorNotes: 'Borderline pre-diabetic pattern. Advised dietary lifestyle modification and carbohydrate control.',
      doctorName: 'Dr. Ananya Sharma, MD',
      kioskLocation: 'Kiosk #01 (HiTech City Metro, Hyderabad)',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    };

    const report2: Report = {
      reportId: 'VMC-REP-7930',
      bookingId: 'VMC-BK-0988',
      userId: demoUserId,
      userName: 'Ravi Teja Kumar',
      userPhone: '+91 98765 43210',
      testType: 'Cholesterol',
      cholesterol: '185 mg/dL',
      summary: 'Your lipid panel shows desirable Total Cholesterol (185 mg/dL) and optimal HDL heart-protective cholesterol.',
      summaryTe: 'మీ లిపిడ్ ప్రొఫైల్ సాధారణంగా ఉంది. కొలెస్ట్రాల్ 185 mg/dL తో సాధారణ హృదయ ఆరోగ్య పరిధిలో ఉంది.',
      advice: 'Keep up with healthy unsaturated fats like nuts and olive oil.',
      biomarkers: [
        {
          name: 'Total Cholesterol',
          nameTe: 'మొత్తం కొలెస్ట్రాల్',
          value: '185',
          numericValue: 185,
          unit: 'mg/dL',
          normalRange: '< 200 mg/dL',
          status: 'normal',
        },
        {
          name: 'HDL (Good Cholesterol)',
          nameTe: 'మంచి కొలెస్ట్రాల్ (HDL)',
          value: '52',
          numericValue: 52,
          unit: 'mg/dL',
          normalRange: '> 40 mg/dL',
          status: 'normal',
        },
      ],
      pdfUrl: '#',
      status: 'verified',
      doctorNotes: 'Optimal lipid profile. Maintain active lifestyle.',
      doctorName: 'Dr. Rajesh Rao, MBBS',
      kioskLocation: 'Kiosk #02 (Indiranagar 100ft Rd, Bengaluru)',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    };

    await setDoc(doc(db, 'reports', report1.reportId), report1);
    await setDoc(doc(db, 'reports', report2.reportId), report2);

    // 3. Seed initial bookings
    await setDoc(doc(db, 'bookings', 'VMC-BK-1021'), {
      bookingId: 'VMC-BK-1021',
      userId: demoUserId,
      userName: 'Ravi Teja Kumar',
      userPhone: '+91 98765 43210',
      testType: 'Blood Sugar',
      status: 'completed',
      kiosk: 'Kiosk #01 (HiTech City Metro, Hyderabad)',
      payment: {
        amount: 99,
        method: 'UPI',
        status: 'success',
        transactionId: 'UPI-TXN-984210',
        upiApp: 'Google Pay',
        paidAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    });

    // 4. Seed initial notifications
    await setDoc(doc(db, 'notifications', 'notif_01'), {
      id: 'notif_01',
      userId: demoUserId,
      title: 'Blood Sugar Report Ready',
      titleTe: 'రక్తంలో గ్లూకోజ్ నివేదిక సిద్ధంగా ఉంది',
      message: 'Your instant diagnostic test from Kiosk #01 is available. AI summary and PDF are ready.',
      messageTe: 'కియోస్క్ #01 నుండి మీ నివేదిక అందుబాటులో ఉంది. AI వివరణ సిద్ధంగా ఉంది.',
      type: 'report_ready',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    });

    await setDoc(doc(db, 'notifications', 'notif_02'), {
      id: 'notif_02',
      userId: demoUserId,
      title: 'Medicine Reminder: Metformin',
      titleTe: 'మందుల రిమైండర్: మెట్ఫార్మిన్',
      message: 'Scheduled 500mg after dinner. Stay consistent with your routine.',
      messageTe: 'రాత్రి భోజనం తర్వాత 500mg తీసుకోవాలి.',
      type: 'medication',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    });

    console.log('Seeded initial VMC data successfully.');
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}
