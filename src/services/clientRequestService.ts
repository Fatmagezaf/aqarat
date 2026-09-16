import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { ClientRequest, ClientRequestFilterParams } from '@/types/clientRequest';

const COLLECTION_NAME = 'clientRequests';

export async function getClientRequests(params: ClientRequestFilterParams = {}): Promise<ClientRequest[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const constraints: any[] = [];
    
    if (params.area) {
      constraints.push(where('area', '==', params.area));
    }
    if (params.purpose) {
      constraints.push(where('purpose', '==', params.purpose));
    }
    if (params.status) {
      constraints.push(where('status', '==', params.status));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    let items: ClientRequest[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as ClientRequest));

    if (params.search && params.search.trim()) {
      const qStr = params.search.trim().toLowerCase();
      items = items.filter(i => 
        i.clientName.toLowerCase().includes(qStr) || 
        i.clientPhone.includes(qStr)
      );
    }

    return items;
  } catch (error) {
    console.error('Firestore getClientRequests failed:', error);
    throw error;
  }
}

export async function createClientRequest(
  inputData: Omit<ClientRequest, 'id' | 'createdAt' | 'updatedAt'>,
  user: { uid: string; displayName: string }
): Promise<ClientRequest> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const payload = {
    ...inputData,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    createdByName: user.displayName || 'User',
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload, createdAt: new Date(), updatedAt: new Date() } as ClientRequest;
  } catch (error) {
    console.error('Firestore createClientRequest failed:', error);
    throw error;
  }
}

export async function updateClientRequest(
  id: string,
  updates: Partial<ClientRequest>
): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured');

  delete (updates as any).createdAt;
  delete (updates as any).createdBy;
  delete (updates as any).createdByName;

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error('Firestore updateClientRequest failed:', error);
    throw error;
  }
}

export async function deleteClientRequest(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured');

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore deleteClientRequest failed:', error);
    throw error;
  }
}
