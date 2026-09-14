import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { UserProfile, UserRole } from '@/types/user';

const USERS_COLLECTION = 'users';

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

  return null;
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

  return [];
}
