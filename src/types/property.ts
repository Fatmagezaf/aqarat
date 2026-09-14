import { Timestamp } from 'firebase/firestore';

export type PropertyPurpose = 
  | 'sale'               // بيع
  | 'rent_furnished'     // إيجار - مفروش
  | 'rent_unfurnished'   // إيجار - قانون جديد
  | 'commercial'         // تجاري
  | 'resale';            // تنازل / إعادة بيع

export type PropertyStatus = 
  | 'available'          // متاح
  | 'reserved'           // محجوز
  | 'sold'               // تم البيع
  | 'rented'             // تم التأجير
  | 'archived';          // معلق / أرشيف

export type DeliveryStatus = 
  | 'ready'              // جاهز للتسليم
  | 'immediate'          // استلام فوري
  | 'under_construction' // تحت الإنشاء
  | 'scheduled';         // موعد محدد

export type FinishingType =
  | 'core_and_shell'     // بدون تشطيب / محارة
  | 'semi_finished'      // نصف تشطيب
  | 'lux'                // لوكس
  | 'super_lux'          // سوبر لوكس
  | 'ultra_super_lux'    // الترا سوبر لوكس
  | 'hotel_furnished';   // فرش فندقي

export interface PropertyPhoto {
  id: string;
  url: string;
  storagePath: string;
  name: string;
  isCover: boolean;
  uploadedAt: Timestamp | string;
}

export interface Property {
  id: string;

  // 1. Identification
  code: string;                  // كود (e.g. FAT-1135)
  codeNormalized: string;        // Uppercase stripped for search
  address: string;               // العنوان (Unit/Group/Building e.g. 12 - 039 - 121)
  fullAddress?: string;          // العنوان التفصيلي

  // 2. Classification & Purpose
  purpose: PropertyPurpose;      // الغرض
  status: PropertyStatus;        // الحالة
  deliveryStatus?: string;       // حالة العقار (e.g. جاهز للتسليم)
  colorTag?: string;             // اللون (#10B981, #EF4444, etc.)

  // 3. Client & Owner Info (Internal confidential)
  ownerName?: string;            // الاسم
  mobile?: string;               // الموبايل
  mobile2?: string;              // الموبايل-2

  // 4. Financials
  price: number;                 // المبلغ (EGP)
  pricePerMeter?: number;        // سعر المتر
  currency: string;              // EGP

  // 5. Specs & Dimensions
  phase?: string;                // المرحلة (e.g. B12)
  area: number;                  // المساحة (m²)
  model?: string;                // النموذج (e.g. 200)
  floor?: string;                // الدور (e.g. الأول)
  viewDirection?: string;        // الوجه (e.g. جانبي, بحري)
  bedrooms?: number;             // نوم
  bathrooms?: number;            // حمام
  landArea?: number;             // مساحة الأرض (m²)
  gardenArea?: number;           // مساحة الحديقة (m²)
  finishing?: string;            // التشطيب (e.g. الترا سوبر لوكس)

  // 6. Location & Map
  locationName: string;          // لوكيشن (e.g. مدينتي, التجمع)
  locationUrl?: string;          // رابط اللوكيشن (Google Maps URL)
  latitude?: number | null;      // خط العرض
  longitude?: number | null;     // خط الطول
  googlePlaceId?: string | null; // Place ID
  formattedAddress?: string;     // عنوان الخريطة المعتمد

  // 7. Badges & Landmarks
  landmark?: string;             // علامة مميزة (وصف المعلم البارز أو الموقع)
  isFeatured: boolean;           // علامة مميزة (تمييز العقار في القوائم)

  // 8. Dates & Handover
  deliveryDate?: string | null;  // تاريخ الاستلام (YYYY-MM-DD)
  listingDate: string;           // تاريخ الإضافة (YYYY-MM-DD)

  // 9. Media
  photos?: PropertyPhoto[];

  // 10. Search Tokens
  searchTokens: string[];        // الكلمات الدلالية للبحث الجزئي

  // 11. System Audit
  createdAt: any;
  createdBy: string;
  createdByName: string;
  updatedAt: any;
  updatedBy: string;
  updatedByName: string;
}

export interface PropertyFilterParams {
  search?: string;
  purpose?: string;
  status?: string;
  locationName?: string;
  phase?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  finishing?: string;
  floor?: string;
  isFeatured?: boolean;
  sortBy?: 'createdAt' | 'price' | 'area' | 'listingDate';
  sortOrder?: 'asc' | 'desc';
}
