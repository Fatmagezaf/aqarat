import { PropertyPurpose, PropertyStatus, DeliveryStatus, FinishingType } from '@/types/property';

export function formatCurrency(amount: number | undefined | null, currency = 'ج.م'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  return `${amount.toLocaleString('ar-EG')} ${currency}`;
}

export function formatArea(area: number | undefined | null): string {
  if (area === undefined || area === null || isNaN(area)) return '—';
  return `${area.toLocaleString('ar-EG')} م²`;
}

export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '—';
  const clean = phone.replace(/\s+/g, '').replace(/-/g, '');
  return clean;
}

export function formatDate(timestampOrDate: any): string {
  if (!timestampOrDate) return '—';

  let date: Date;
  if (timestampOrDate?.toDate && typeof timestampOrDate.toDate === 'function') {
    date = timestampOrDate.toDate();
  } else if (timestampOrDate instanceof Date) {
    date = timestampOrDate;
  } else if (typeof timestampOrDate === 'string') {
    date = new Date(timestampOrDate);
  } else if (timestampOrDate?.seconds) {
    date = new Date(timestampOrDate.seconds * 1000);
  } else {
    return String(timestampOrDate);
  }

  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export const PURPOSE_LABELS: Record<PropertyPurpose, { ar: string; en: string; color: string }> = {
  sale: { ar: 'بيع', en: 'For Sale', color: '#10B981' },
  rent_furnished: { ar: 'إيجار - مفروش', en: 'Rent - Furnished', color: '#3B82F6' },
  rent_unfurnished: { ar: 'إيجار - غير مفروش', en: 'Rent - Unfurnished', color: '#6366F1' },
  commercial: { ar: 'تجاري', en: 'Commercial', color: '#F59E0B' },
  resale: { ar: 'تنازل / إعادة بيع', en: 'Resale', color: '#8B5CF6' },
};

export const STATUS_LABELS: Record<PropertyStatus, { ar: string; en: string; badgeClass: string; color: string }> = {
  available: { ar: 'متاح', en: 'Available', badgeClass: 'badge-success', color: '#10B981' },
  reserved: { ar: 'محجوز', en: 'Reserved', badgeClass: 'badge-warning', color: '#F59E0B' },
  sold: { ar: 'تم البيع', en: 'Sold', badgeClass: 'badge-danger', color: '#EF4444' },
  rented: { ar: 'تم التأجير', en: 'Rented', badgeClass: 'badge-info', color: '#3B82F6' },
  archived: { ar: 'معلق / أرشيف', en: 'Archived', badgeClass: 'badge-secondary', color: '#6B7280' },
};

export const FINISHING_OPTIONS = [
  { value: 'core_and_shell', label: 'بدون تشطيب (محارة وحلوق)' },
  { value: 'semi_finished', label: 'نصف تشطيب' },
  { value: 'lux', label: 'لوكس' },
  { value: 'super_lux', label: 'سوبر لوكس' },
  { value: 'ultra_super_lux', label: 'الترا سوبر لوكس' },
  { value: 'hotel_furnished', label: 'فرش فندقي' },
];

export const VIEW_OPTIONS = [
  { value: 'بحري', label: 'بحري صريح' },
  { value: 'جانبي', label: 'جانبي' },
  { value: 'وايد جاردن', label: 'وايد جاردن / حديقة مفتوحة' },
  { value: 'شارع رئيسي', label: 'شارع رئيسي' },
  { value: 'مفتوح', label: 'فيو مفتوح غير مجروح' },
  { value: 'ناصية', label: 'ناصية' },
];

export const FLOOR_OPTIONS = [
  { value: 'أرضي بدون حديقة', label: 'أرضي بدون حديقة' },
  { value: 'أرضي بحديقة', label: 'أرضي بحديقة خاصة' },
  { value: 'الأول', label: 'الدور الأول' },
  { value: 'متكرر', label: 'دور متكرر (ثاني / ثالث / رابع)' },
  { value: 'أخير', label: 'الدور الأخير' },
  { value: 'بنتهاوس / روف', label: 'بنتهاوس / روف' },
  { value: 'فيلا كاملة', label: 'فيلا كاملة' },
];

export const COLOR_TAG_OPTIONS = [
  { label: 'أخضر (صفقة مميزة)', hex: '#10B981' },
  { label: 'أزرق (إيجار)', hex: '#3B82F6' },
  { label: 'برتقالي (عاجل / للمتابعة)', hex: '#F59E0B' },
  { label: 'أحمر (مطلوب فوراً)', hex: '#EF4444' },
  { label: 'بنفسجي (تجاري / إداري)', hex: '#8B5CF6' },
  { label: 'رمادي (عادي)', hex: '#6B7280' },
];
