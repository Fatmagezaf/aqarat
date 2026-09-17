'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  Building,
  DollarSign,
  User,
  Phone,
  Maximize2,
  MapPin,
  Calendar,
  Sparkles,
  Tag,
  Save,
  ArrowRight,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Property, PropertyPurpose, PropertyStatus } from '@/types/property';
import { useAuth } from '@/context/AuthContext';
import { createProperty, updateProperty } from '@/services/propertyService';
import PropertyMap from '@/components/map/PropertyMap';
import {
  PURPOSE_LABELS,
  STATUS_LABELS,
  FINISHING_OPTIONS,
  VIEW_OPTIONS,
  FLOOR_OPTIONS,
  COLOR_TAG_OPTIONS,
} from '@/lib/utils/formatters';

const propertySchema = z.object({
  // 1. Identification
  code: z.string().min(2, 'كود العقار مطلوب (مثال: FAT-1135)'),
  address: z.string().min(2, 'العنوان مطلوب (مثال: 12 - 039 - 121)'),
  fullAddress: z.string().optional(),
  colorTag: z.string().optional(),

  // 2. Purpose & Status
  purpose: z.enum(['sale', 'rent_furnished', 'rent_unfurnished', 'commercial', 'resale'] as const),
  status: z.enum(['available', 'reserved', 'sold', 'rented', 'archived'] as const),
  deliveryStatus: z.string().optional(),
  isFeatured: z.boolean().default(false),

  // 3. Owner & Contact
  ownerName: z.string().optional(),
  mobile: z.string().optional(),
  mobile2: z.string().optional(),

  // 4. Financials
  price: z.coerce.number().min(1, 'المبلغ يجب أن يكون أكبر من 0'),
  pricePerMeter: z.coerce.number().optional(),

  // 5. Specs & Dimensions
  phase: z.string().optional(),
  area: z.coerce.number().min(1, 'المساحة مطلوبة ويجب أن تكون أكبر من 0'),
  model: z.string().optional(),
  floor: z.string().optional(),
  viewDirection: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  landArea: z.coerce.number().optional(),
  gardenArea: z.coerce.number().optional(),
  finishing: z.string().optional(),
  landmark: z.string().optional(),

  // 6. Location & Map
  locationName: z.string().min(2, 'اسم الموقع / المنطقة مطلوب (مثال: مدينتي)'),
  locationUrl: z.string().optional(),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),

  // 7. Dates
  deliveryDate: z.string().nullable().optional(),
  listingDate: z.string(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Property;
  isEdit?: boolean;
}

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const router = useRouter();
  const { userProfile, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayIso = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      code: initialData?.code || '',
      address: initialData?.address || '',
      fullAddress: initialData?.fullAddress || '',
      colorTag: initialData?.colorTag || '#10B981',
      purpose: initialData?.purpose || 'rent_furnished',
      status: initialData?.status || 'available',
      deliveryStatus: initialData?.deliveryStatus || 'جاهز للتسليم',
      isFeatured: initialData?.isFeatured || false,
      ownerName: initialData?.ownerName || '',
      mobile: initialData?.mobile || '',
      mobile2: initialData?.mobile2 || '',
      price: initialData?.price || ('' as any),
      pricePerMeter: initialData?.pricePerMeter || ('' as any),
      phase: initialData?.phase || '',
      area: initialData?.area || ('' as any),
      model: initialData?.model || '',
      floor: initialData?.floor || 'الأول',
      viewDirection: initialData?.viewDirection || 'جانبي',
      bedrooms: initialData?.bedrooms ?? 2,
      bathrooms: initialData?.bathrooms ?? 1,
      landArea: initialData?.landArea || ('' as any),
      gardenArea: initialData?.gardenArea || ('' as any),
      finishing: initialData?.finishing || 'الترا سوبر لوكس',
      landmark: initialData?.landmark || '',
      locationName: initialData?.locationName || 'مدينتي',
      locationUrl: initialData?.locationUrl || '',
      latitude: initialData?.latitude || 30.0967,
      longitude: initialData?.longitude || 31.6294,
      deliveryDate: initialData?.deliveryDate || todayIso,
      listingDate: initialData?.listingDate || todayIso,
    },
  });

  const watchedPrice = watch('price');
  const watchedArea = watch('area');
  const watchedLat = watch('latitude');
  const watchedLng = watch('longitude');
  const watchedColor = watch('colorTag');

  // Auto-compute price per meter when price or area changes
  useEffect(() => {
    if (watchedPrice && watchedArea && Number(watchedArea) > 0) {
      const calculated = Math.round(Number(watchedPrice) / Number(watchedArea));
      setValue('pricePerMeter', calculated);
    }
  }, [watchedPrice, watchedArea, setValue]);

  // Auto-generate unique property code if adding new
  useEffect(() => {
    if (!isEdit && !initialData?.code) {
      const displayName = userProfile?.displayName || user?.email || 'USR';
      // Get first 3 letters, removing spaces and making uppercase
      const prefix = displayName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      // Generate a random number between 1000 and 99999
      const randomPart = Math.floor(1000 + Math.random() * 90000).toString();
      setValue('code', `${prefix}-${randomPart}`);
    }
  }, [isEdit, initialData, setValue, userProfile, user]);

  const handleMapLocationChange = (lat: number, lng: number, addr?: string, url?: string) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    if (url) setValue('locationUrl', url);
    if (addr) setValue('fullAddress', addr);
  };

  const onSubmit = async (data: any) => {
    setFormError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    const currentUser = {
      uid: user?.uid || userProfile?.uid || 'user_demo',
      displayName: userProfile?.displayName || 'مسؤول النظام',
    };

    try {
      if (isEdit && initialData?.id) {
        await updateProperty(initialData.id, data as any, currentUser);
        setSuccessMessage('تم تحديث بيانات العقار بنجاح!');
        setTimeout(() => {
          router.push(`/properties/${initialData.id}`);
        }, 1000);
      } else {
        const created = await createProperty(data as any, currentUser);
        setSuccessMessage('تم إضافة العقار الجديد وحفظه بنجاح!');
        setTimeout(() => {
          router.push(`/properties/${created.id}`);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError(err.message || 'حدث خطأ أثناء حفظ بيانات العقار. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '8px' }}
          >
            <ArrowRight size={16} />
            العودة
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {isEdit ? `تعديل بيانات العقار (${initialData?.code})` : 'إضافة عقار جديد إلى قاعدة البيانات'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            يرجى ملء الحقول المطلوبة وفقاً للبيانات المعتمدة
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? 'حفظ التعديلات' : 'حفظ العقار الآن'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            background: 'var(--success-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#6EE7B7',
            marginBottom: '24px',
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {formError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            background: 'var(--danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#FCA5A5',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{formError}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Identification & Basic Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Tag size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>1. البيانات الأساسية والترميز</h2>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">
                كود العقار <span className="required">*</span>
              </label>
              <input
                type="text"
                {...register('code')}
                className="form-input"
                placeholder="يتم توليده تلقائياً"
                dir="ltr"
                readOnly
                style={{ backgroundColor: 'var(--bg-surface-elevated)', cursor: 'not-allowed', opacity: 0.8 }}
              />
              {errors.code && <span className="form-error">{errors.code.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                العنوان (كود الوحدة) <span className="required">*</span>
              </label>
              <input
                type="text"
                {...register('address')}
                className="form-input"
                placeholder="مثال: 12 - 039 - 121"
              />
              {errors.address && <span className="form-error">{errors.address.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">اللون التعريفي</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '44px' }}>
                {COLOR_TAG_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setValue('colorTag', c.hex)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: watchedColor === c.hex ? '3px solid #FFF' : '1px solid transparent',
                      cursor: 'pointer',
                      transform: watchedColor === c.hex ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">العنوان التفصيلي (الشارع / المجموعة / العمارة)</label>
            <input
              type="text"
              {...register('fullAddress')}
              className="form-input"
              placeholder="مثال: مجموعة 12، عمارة 39، شقة 121، مدينتي"
            />
          </div>
        </div>

        {/* Section 2: Purpose & Classification */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Building size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>2. التصنيف والاستخدام والحالة</h2>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">
                الغرض / الاستخدام <span className="required">*</span>
              </label>
              <select {...register('purpose')} className="form-select">
                {(Object.keys(PURPOSE_LABELS) as PropertyPurpose[]).map((key) => (
                  <option key={key} value={key}>
                    {PURPOSE_LABELS[key].ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                الحالة التشغيلية <span className="required">*</span>
              </label>
              <select {...register('status')} className="form-select">
                {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABELS[key].ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">حالة العقار (الجاهزية)</label>
              <input
                type="text"
                {...register('deliveryStatus')}
                className="form-input"
                placeholder="مثال: جاهز للتسليم / استلام فوري"
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">تاريخ الاستلام</label>
              <input type="date" {...register('deliveryDate')} className="form-input" dir="ltr" />
            </div>

            <div className="form-group">
              <label className="form-label">تاريخ الإضافة</label>
              <input type="date" {...register('listingDate')} className="form-input" dir="ltr" />
            </div>

            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <Sparkles size={18} color="#F59E0B" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>تمييز العقار (علامة مميزة / Starred)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Client & Owner Contacts (Internal) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>3. بيانات المالك والعميل (خاصة داخلية)</h2>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">اسم المالك / العميل</label>
              <input
                type="text"
                {...register('ownerName')}
                className="form-input"
                placeholder="مثال: أحمد محمود"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={15} />
                الموبايل الأساسي
              </label>
              <input
                type="text"
                {...register('mobile')}
                className="form-input"
                placeholder="مثال: 01012345678"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={15} />
                الموبايل الثاني / واتساب
              </label>
              <input
                type="text"
                {...register('mobile2')}
                className="form-input"
                placeholder="مثال: 01198765432"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Financials & Pricing */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <DollarSign size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>4. الأسعار والبيانات المالية</h2>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                المبلغ الإجمالي / الإيجار (ج.م) <span className="required">*</span>
              </label>
              <input
                type="number"
                {...register('price')}
                className="form-input"
                placeholder="مثال: 25000"
                dir="ltr"
              />
              {errors.price && <span className="form-error">{errors.price.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                سعر المتر (ج.م)
                <span className="form-hint">(يُحسب تلقائياً: المبلغ ÷ المساحة)</span>
              </label>
              <input
                type="number"
                {...register('pricePerMeter')}
                className="form-input"
                placeholder="مثال: 337"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Dimensions, Layout & Finishing */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Maximize2 size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>5. المساحات والمواصفات المعمارية والتشطيب</h2>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">
                المساحة المبنية (م²) <span className="required">*</span>
              </label>
              <input
                type="number"
                {...register('area')}
                className="form-input"
                placeholder="مثال: 74"
                dir="ltr"
              />
              {errors.area && <span className="form-error">{errors.area.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">المرحلة / المجموعة</label>
              <input
                type="text"
                {...register('phase')}
                className="form-input"
                placeholder="مثال: B12"
              />
            </div>

            <div className="form-group">
              <label className="form-label">النموذج</label>
              <input
                type="text"
                {...register('model')}
                className="form-input"
                placeholder="مثال: 200"
              />
            </div>
          </div>

          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">الدور</label>
              <select {...register('floor')} className="form-select">
                {FLOOR_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">الوجه / الإطلالة</label>
              <select {...register('viewDirection')} className="form-select">
                {VIEW_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">عدد الغرف (نوم)</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="form-input"
                placeholder="2"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">عدد الحمامات</label>
              <input
                type="number"
                {...register('bathrooms')}
                className="form-input"
                placeholder="1"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">مستوى التشطيب</label>
              <select {...register('finishing')} className="form-select">
                {FINISHING_OPTIONS.map((spec) => (
                  <option key={spec.value} value={spec.label}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">مساحة الأرض (م²) - للفيلات</label>
              <input
                type="number"
                {...register('landArea')}
                className="form-input"
                placeholder="اختياري"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">مساحة الحديقة (م²)</label>
              <input
                type="number"
                {...register('gardenArea')}
                className="form-input"
                placeholder="اختياري للأرضي"
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              علامة مميزة (وصف المعلم البارز / ميزة العقار)
            </label>
            <input
              type="text"
              {...register('landmark')}
              className="form-input"
              placeholder="مثال: بجوار المسجد الجامع وخطوات من الكرافت زون - فيو وايد جاردن"
            />
          </div>
        </div>

        {/* Section 6: Location & Interactive Google Map */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MapPin size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>6. الموقع والإحداثيات والخريطة التفاعلية</h2>
          </div>

          <div className="grid-3" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                المنطقة / المدينة (لوكيشن) <span className="required">*</span>
              </label>
              <input
                type="text"
                {...register('locationName')}
                className="form-input"
                placeholder="مثال: مدينتي / التجمع الخامس"
              />
              {errors.locationName && <span className="form-error">{errors.locationName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">خط العرض (Latitude)</label>
              <input
                type="number"
                step="any"
                {...register('latitude')}
                className="form-input"
                placeholder="30.0967"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">خط الطول (Longitude)</label>
              <input
                type="number"
                step="any"
                {...register('longitude')}
                className="form-input"
                placeholder="31.6294"
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">رابط موقع خرائط Google (يتحدث تلقائياً عند تحريك المؤشر)</label>
            <input
              type="url"
              {...register('locationUrl')}
              className="form-input"
              placeholder="https://maps.google.com/?q=..."
              dir="ltr"
            />
          </div>

          {/* Embedded Interactive Map for Pin Dropping */}
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <PropertyMap
              mode="picker"
              latitude={watchedLat}
              longitude={watchedLng}
              onLocationChange={handleMapLocationChange}
              height="380px"
            />
          </div>
        </div>

        {/* Audit info preview if editing */}
        {isEdit && initialData && (
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <strong>بواسطة:</strong> {initialData.createdByName || '—'}
            </div>
            <div>
              <strong>آخر تعديل:</strong> {initialData.updatedByName || '—'}
            </div>
          </div>
        )}

        {/* Bottom Save Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '180px' }} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                جاري حفظ البيانات...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? 'تحديث العقار' : 'حفظ العقار في النظام'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
