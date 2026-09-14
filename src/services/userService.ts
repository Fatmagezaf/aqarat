import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { UserProfile, UserRole } from '@/types/user';

const USERS_COLLECTION = 'users';

export const DEFAULT_DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo-admin-fatma',
    email: 'admin@estatecrm.com',
    displayName: 'فاطمة - مدير النظام',
    role: 'admin',
    phone: '01011223344',
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    uid: 'demo-agent-passant',
    email: 'agent@estatecrm.com',
    displayName: 'بسنت - مسؤول المبيعات',
    role: 'agent',
    phone: '01055667788',
    isActive: true,
    createdAt: new Date('2025-02-01'),
  },
  {
    uid: 'demo-viewer-guest',
    email: 'viewer@estatecrm.com',
    displayName: 'مستعرض - ضيف',
    role: 'viewer',
    phone: '01099887766',
    isActive: true,
    createdAt: new Date('2025-03-01'),
  },
];

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore getUserProfile failed:', err);
    }
  }

  // Fallback to demo users
  const found = DEFAULT_DEMO_USERS.find((u) => u.uid === uid);
  return found || null;
}

export async function createOrUpdateUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, USERS_COLLECTION, profile.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return;
    } catch (err) {
      console.warn('Firestore setUserProfile failed:', err);
    }
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      return snap.docs.map((d) => d.data() as UserProfile);
    } catch (err) {
      console.warn('Firestore getAllUsers failed:', err);
    }
  }

  return DEFAULT_DEMO_USERS;
}
