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
  limit,
  startAfter,
  serverTimestamp,
  QueryConstraint,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { Property, PropertyFilterParams } from '@/types/property';
import { generateSearchTokens, normalizeArabic } from '@/lib/utils/arabic';

const COLLECTION_NAME = 'properties';

export interface GetPropertiesResult {
  properties: Property[];
  lastVisible?: any;
  hasMore: boolean;
  totalCount: number;
}

export async function getProperties(
  params: PropertyFilterParams = {},
  pageSize: number = 20,
  lastVisibleDoc?: any
): Promise<GetPropertiesResult> {
  if (!isFirebaseConfigured || !db) {
    return { properties: [], hasMore: false, totalCount: 0 };
  }

  try {
    const constraints: QueryConstraint[] = [];

    // 1. Search filter via searchTokens
    if (params.search && params.search.trim()) {
      const normalized = normalizeArabic(params.search.trim());
      constraints.push(where('searchTokens', 'array-contains', normalized));
    }

    // 2. Exact filters
    if (params.purpose) {
      constraints.push(where('purpose', '==', params.purpose));
    }
    if (params.status) {
      constraints.push(where('status', '==', params.status));
    }
    if (params.locationName) {
      constraints.push(where('locationName', '==', params.locationName));
    }
    if (params.isFeatured !== undefined) {
      constraints.push(where('isFeatured', '==', params.isFeatured));
    }

    // Sorting
    const sortField = params.sortBy || 'createdAt';
    const sortDirection = params.sortOrder || 'desc';
    constraints.push(orderBy(sortField, sortDirection));

    // Pagination
    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }
    constraints.push(limit(pageSize + 1));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const items: Property[] = [];
    snapshot.docs.slice(0, pageSize).forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Property);
    });

    const hasMore = snapshot.docs.length > pageSize;
    const newLastVisible = snapshot.docs[Math.min(pageSize, snapshot.docs.length) - 1] || null;

    return {
      properties: items,
      lastVisible: newLastVisible,
      hasMore,
      totalCount: items.length, // totalCount within the current snapshot range, actual total needs aggregation
    };
  } catch (error) {
    console.error('Firestore query failed:', error);
    throw error;
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Property;
    }
    return null;
  } catch (error) {
    console.error('Firestore getDoc failed:', error);
    throw error;
  }
}

export async function createProperty(
  inputData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'searchTokens' | 'codeNormalized'>,
  user: { uid: string; displayName: string }
): Promise<Property> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  const codeNormalized = inputData.code.trim().toUpperCase();
  const calculatedPricePerMeter =
    inputData.pricePerMeter || (inputData.area > 0 ? Math.round(inputData.price / inputData.area) : 0);

  const searchTokens = generateSearchTokens([
    inputData.code,
    inputData.address,
    inputData.fullAddress,
    inputData.locationName,
    inputData.phase,
    inputData.model,
    inputData.ownerName,
    inputData.mobile,
    inputData.landmark,
    inputData.finishing,
    inputData.deliveryStatus,
  ]);

  const newPropertyData = {
    ...inputData,
    codeNormalized,
    pricePerMeter: calculatedPricePerMeter,
    searchTokens,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    createdByName: user.displayName || 'Agent',
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
    updatedByName: user.displayName || 'Agent',
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPropertyData);
    return { id: docRef.id, ...newPropertyData, createdAt: new Date(), updatedAt: new Date() } as Property;
  } catch (error) {
    console.error('Firestore addDoc failed:', error);
    throw error;
  }
}

export async function updateProperty(
  id: string,
  updates: Partial<Property>,
  user: { uid: string; displayName: string }
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  delete (updates as any).createdAt;
  delete (updates as any).createdBy;
  delete (updates as any).createdByName;

  if (updates.code) {
    updates.codeNormalized = updates.code.trim().toUpperCase();
  }

  if (updates.price && updates.area) {
    updates.pricePerMeter = Math.round(updates.price / updates.area);
  }

  updates.searchTokens = generateSearchTokens([
    updates.code,
    updates.address,
    updates.fullAddress,
    updates.locationName,
    updates.phase,
    updates.model,
    updates.ownerName,
    updates.mobile,
    updates.landmark,
    updates.finishing,
    updates.deliveryStatus,
  ]);

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
    updatedByName: user.displayName || 'Agent',
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error('Firestore updateDoc failed:', error);
    throw error;
  }
}

export async function deleteProperty(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore deleteDoc failed:', error);
    throw error;
  }
}

export interface DashboardStats {
  total: number;
  available: number;
  rented: number;
  sold: number;
  reserved: number;
  readyForDelivery: number;
  featured: number;
  locationsCount: Record<string, number>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isFirebaseConfigured || !db) {
    return {
      total: 0,
      available: 0,
      rented: 0,
      sold: 0,
      reserved: 0,
      readyForDelivery: 0,
      featured: 0,
      locationsCount: {},
    };
  }

  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map((d) => d.data() as Property);

    const stats: DashboardStats = {
      total: all.length,
      available: 0,
      rented: 0,
      sold: 0,
      reserved: 0,
      readyForDelivery: 0,
      featured: 0,
      locationsCount: {},
    };

    for (const p of all) {
      if (p.status === 'available') stats.available++;
      else if (p.status === 'rented') stats.rented++;
      else if (p.status === 'sold') stats.sold++;
      else if (p.status === 'reserved') stats.reserved++;

      if (p.deliveryStatus === 'جاهز للتسليم' || p.deliveryStatus === 'ready' || p.deliveryStatus === 'استلام فوري') {
        stats.readyForDelivery++;
      }

      if (p.isFeatured) stats.featured++;

      if (p.locationName) {
        stats.locationsCount[p.locationName] = (stats.locationsCount[p.locationName] || 0) + 1;
      }
    }

    return stats;
  } catch (err) {
    console.error('Firestore stats failed:', err);
    throw err;
  }
}
