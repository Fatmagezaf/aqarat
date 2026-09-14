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
import { INITIAL_MOCK_PROPERTIES } from './mockData';

const COLLECTION_NAME = 'properties';

// Local storage fallback helper for offline/demo development
const STORAGE_KEY = 'realestate_crm_properties_cache';

function getLocalProperties(): Property[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_PROPERTIES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PROPERTIES));
      return INITIAL_MOCK_PROPERTIES;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_MOCK_PROPERTIES;
  }
}

function saveLocalProperties(props: Property[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(props));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

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
  // If Firestore is configured and live, query Firestore
  if (isFirebaseConfigured && db) {
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
        totalCount: items.length,
      };
    } catch (error) {
      console.warn('Firestore query failed, falling back to local dataset:', error);
    }
  }

  // Fallback: Local dataset (in-memory / localStorage)
  let items = [...getLocalProperties()];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = normalizeArabic(params.search.trim());
    items = items.filter((p) => {
      const codeMatch = p.code.toLowerCase().includes(q) || (p.codeNormalized && p.codeNormalized.toLowerCase().includes(q));
      const addressMatch = normalizeArabic(p.address).includes(q) || normalizeArabic(p.fullAddress || '').includes(q);
      const locMatch = normalizeArabic(p.locationName).includes(q);
      const landmarkMatch = normalizeArabic(p.landmark || '').includes(q);
      const ownerMatch = normalizeArabic(p.ownerName || '').includes(q);
      const phoneMatch = (p.mobile || '').includes(q) || (p.mobile2 || '').includes(q);
      const tokenMatch = p.searchTokens?.some((t) => t.includes(q));
      return codeMatch || addressMatch || locMatch || landmarkMatch || ownerMatch || phoneMatch || tokenMatch;
    });
  }

  // Filter Purpose
  if (params.purpose) {
    items = items.filter((p) => p.purpose === params.purpose);
  }

  // Filter Status
  if (params.status) {
    items = items.filter((p) => p.status === params.status);
  }

  // Filter Location
  if (params.locationName) {
    items = items.filter((p) => p.locationName === params.locationName);
  }

  // Filter Phase
  if (params.phase) {
    items = items.filter((p) => p.phase?.toLowerCase() === params.phase?.toLowerCase());
  }

  // Filter Price Range
  if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
    items = items.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
    items = items.filter((p) => p.price <= params.maxPrice!);
  }

  // Filter Area Range
  if (params.minArea !== undefined && !isNaN(params.minArea)) {
    items = items.filter((p) => p.area >= params.minArea!);
  }
  if (params.maxArea !== undefined && !isNaN(params.maxArea)) {
    items = items.filter((p) => p.area <= params.maxArea!);
  }

  // Filter Bedrooms
  if (params.bedrooms !== undefined && !isNaN(params.bedrooms)) {
    items = items.filter((p) => (p.bedrooms || 0) >= params.bedrooms!);
  }

  // Filter Bathrooms
  if (params.bathrooms !== undefined && !isNaN(params.bathrooms)) {
    items = items.filter((p) => (p.bathrooms || 0) >= params.bathrooms!);
  }

  // Filter Finishing
  if (params.finishing) {
    items = items.filter((p) => p.finishing === params.finishing);
  }

  // Filter Floor
  if (params.floor) {
    items = items.filter((p) => p.floor === params.floor);
  }

  // Filter Featured
  if (params.isFeatured !== undefined) {
    items = items.filter((p) => p.isFeatured === params.isFeatured);
  }

  // Sorting
  const sortDirection = params.sortOrder === 'asc' ? 1 : -1;
  if (params.sortBy === 'price') {
    items.sort((a, b) => (a.price - b.price) * sortDirection);
  } else if (params.sortBy === 'area') {
    items.sort((a, b) => (a.area - b.area) * sortDirection);
  } else {
    // Default by date
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.listingDate).getTime();
      const dateB = new Date(b.createdAt || b.listingDate).getTime();
      return (dateA - dateB) * sortDirection;
    });
  }

  const totalCount = items.length;
  const paginated = items.slice(0, pageSize);

  return {
    properties: paginated,
    hasMore: items.length > pageSize,
    totalCount,
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Property;
      }
    } catch (error) {
      console.warn('Firestore getDoc failed, checking local:', error);
    }
  }

  const localList = getLocalProperties();
  const found = localList.find((p) => p.id === id);
  return found || null;
}

export async function createProperty(
  inputData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'searchTokens' | 'codeNormalized'>,
  user: { uid: string; displayName: string }
): Promise<Property> {
  const codeNormalized = inputData.code.trim().toUpperCase();
  const calculatedPricePerMeter =
    inputData.pricePerMeter || (inputData.area > 0 ? Math.round(inputData.price / inputData.area) : 0);

  // Generate multi-field search tokens
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

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newPropertyData);
      return { id: docRef.id, ...newPropertyData, createdAt: new Date(), updatedAt: new Date() } as Property;
    } catch (error) {
      console.warn('Firestore addDoc failed, storing in local storage:', error);
    }
  }

  // Fallback to local storage
  const localList = getLocalProperties();
  const createdProp: Property = {
    ...newPropertyData,
    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Property;

  localList.unshift(createdProp);
  saveLocalProperties(localList);
  return createdProp;
}

export async function updateProperty(
  id: string,
  updates: Partial<Property>,
  user: { uid: string; displayName: string }
): Promise<void> {
  // Prevent client tampering of immutable audit fields
  delete (updates as any).createdAt;
  delete (updates as any).createdBy;
  delete (updates as any).createdByName;

  if (updates.code) {
    updates.codeNormalized = updates.code.trim().toUpperCase();
  }

  if (updates.price && updates.area) {
    updates.pricePerMeter = Math.round(updates.price / updates.area);
  }

  // Refresh search tokens
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

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, payload);
      return;
    } catch (error) {
      console.warn('Firestore updateDoc failed, updating local storage:', error);
    }
  }

  const localList = getLocalProperties();
  const idx = localList.findIndex((p) => p.id === id);
  if (idx !== -1) {
    localList[idx] = {
      ...localList[idx],
      ...updates,
      updatedAt: new Date(),
      updatedBy: user.uid,
      updatedByName: user.displayName || 'Agent',
    };
    saveLocalProperties(localList);
  }
}

export async function deleteProperty(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      console.warn('Firestore deleteDoc failed, removing from local storage:', error);
    }
  }

  const localList = getLocalProperties();
  const filtered = localList.filter((p) => p.id !== id);
  saveLocalProperties(filtered);
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
  const result = await getProperties({}, 1000);
  const all = result.properties;

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
}
