'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import PropertyMap from '@/components/map/PropertyMap';
import { getPropertyById, deleteProperty } from '@/services/propertyService';
import { Property } from '@/types/property';
import { useAuth } from '@/context/AuthContext';
import {
  formatCurrency,
  formatArea,
  formatDate,
  formatPhoneNumber,
  PURPOSE_LABELS,
  STATUS_LABELS,
} from '@/lib/utils/formatters';
import {
  ArrowRight,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Building,
  User,
  Phone,
  Calendar,
  Maximize2,
  DollarSign,
  Sparkles,
  Shield,
  Loader2,
  Printer,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { canEdit, canDelete, isViewer } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId) return;
      setLoading(true);
      try {
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [propertyId]);

  const handleDelete = async () => {
    if (!property) return;
    if (confirm(`هل أنت متأكد من حذف العقار (${property.code}) نهائياً؟`)) {
      try {
        await deleteProperty(property.id);
        router.push('/properties');
      } catch (err) {
        console.error('Failed to delete property:', err);
      }
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '14px' }}>
          <Loader2 size={36} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>جاري استرجاع بيانات العقار...</span>
        </div>
      </AppShell>
    );
  }

  if (!property) {
    return (
      <AppShell>
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>عفواً، العقار غير موجود</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            ربما تم حذف هذا العقار أو أن الرابط غير صحيح.
          </p>
          <Link href="/properties" className="btn btn-primary">
            العودة إلى قائمة العقارات
          </Link>
        </div>
      </AppShell>
    );
  }

  const purposeInfo = PURPOSE_LABELS[property.purpose] || { ar: property.purpose, color: '#9CA3AF' };
  const statusInfo = STATUS_LABELS[property.status] || { ar: property.status, badgeClass: 'badge-secondary' };

  return (
    <AppShell>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Header & Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <button
              onClick={() => router.push('/properties')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '8px' }}
            >
              <ArrowRight size={16} />
              العودة للقائمة
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '12px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: property.colorTag || '#3B82F6',
                }}
              />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                {property.code} - {property.address}
              </h1>
              {property.isFeatured && (
                <span className="badge badge-warning">
                  <Sparkles size={14} /> عقار مميز
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {property.locationName} {property.phase ? `• مرحلة ${property.phase}` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              title="طباعة تفاصيل العقار"
            >
              <Printer size={16} />
              طباعة
            </button>

            {canEdit && (
              <Link href={`/properties/${property.id}/edit`} className="btn btn-primary btn-sm">
                <Edit size={16} />
                تعديل العقار
              </Link>
            )}

            {canDelete && (
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                <Trash2 size={16} />
                حذف
              </button>
            )}
          </div>
        </div>

        {/* Highlight Banner Cards */}
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          {/* Price Card */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>المبلغ المطلوب:</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', margin: '6px 0' }}>
              {formatCurrency(property.price)}
            </div>
            {property.pricePerMeter ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                سعر المتر: {formatCurrency(property.pricePerMeter, 'ج.م / م²')}
              </div>
            ) : null}
          </div>

          {/* Purpose & Status Card */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>الغرض والحالة:</span>
            <div style={{ display: 'flex', gap: '8px', margin: '8px 0', alignItems: 'center' }}>
              <span
                className="badge"
                style={{
                  backgroundColor: `${purposeInfo.color}20`,
                  color: purposeInfo.color,
                  border: `1px solid ${purposeInfo.color}40`,
                  fontSize: '0.9rem',
                  padding: '6px 14px',
                }}
              >
                {purposeInfo.ar}
              </span>
              <span className={`badge ${statusInfo.badgeClass}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                {statusInfo.ar}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              حالة الجاهزية: {property.deliveryStatus || 'جاهز للتسليم'}
            </div>
          </div>

          {/* Area & Rooms Card */}
          <div className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>المساحة والتقسيم:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', margin: '6px 0' }}>
              {formatArea(property.area)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {property.bedrooms ? `${property.bedrooms} نوم` : '—'} • {property.bathrooms ? `${property.bathrooms} حمام` : '—'} • {property.floor || 'الدور —'}
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Specifications */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={20} color="var(--primary)" />
              المواصفات والبيانات المعمارية
            </h2>

            <div className="grid-3" style={{ gap: '18px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>المرحلة:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.phase || '—'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>النموذج:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.model || '—'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>الدور:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.floor || '—'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>الوجه / الإطلالة:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.viewDirection || '—'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>التشطيب:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.finishing || '—'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>مساحة الحديقة:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.gardenArea ? formatArea(property.gardenArea) : '—'}</p>
              </div>
            </div>

            {property.landmark && (
              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>علامة مميزة / وصف المعلم:</span>
                <p style={{ fontWeight: 600, color: '#FFF', marginTop: '4px' }}>{property.landmark}</p>
              </div>
            )}
          </div>

          {/* Section 2: Owner / Contact Information (Confidential) */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="var(--primary)" />
              بيانات المالك والاتصال (خاصة داخلية)
            </h2>

            {isViewer ? (
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Shield size={18} />
                بيانات التواصل محجوبة عن صلاحية المشاهد. مخصصة للمسؤولين والوكلاء فقط.
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '18px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>اسم المالك / العميل:</span>
                  <p style={{ fontWeight: 600, color: '#FFF' }}>{property.ownerName || '—'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>الموبايل الأساسي:</span>
                  <p style={{ fontWeight: 600, color: '#60A5FA', direction: 'ltr', textAlign: 'right' }}>
                    {property.mobile ? (
                      <a href={`tel:${property.mobile}`} style={{ color: '#60A5FA' }}>
                        {formatPhoneNumber(property.mobile)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>الموبايل الثاني / واتساب:</span>
                  <p style={{ fontWeight: 600, color: '#60A5FA', direction: 'ltr', textAlign: 'right' }}>
                    {property.mobile2 ? (
                      <a href={`https://wa.me/2${property.mobile2.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#34D399' }}>
                        {formatPhoneNumber(property.mobile2)} (WhatsApp)
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Location & Interactive Map */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="var(--primary)" />
                الموقع والإحداثيات الجغرافية
              </h2>

              {property.locationUrl ? (
                <a
                  href={property.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  فتح في خرائط Google
                  <ExternalLink size={14} />
                </a>
              ) : property.latitude && property.longitude ? (
                <a
                  href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  فتح في خرائط Google
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>

            <div className="grid-3" style={{ marginBottom: '16px', gap: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>المدينة / المنطقة:</span>
                <p style={{ fontWeight: 600, color: '#FFF' }}>{property.locationName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>خط العرض (Latitude):</span>
                <p style={{ fontWeight: 600, color: '#FFF', direction: 'ltr', textAlign: 'right' }}>
                  {property.latitude || '—'}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>خط الطول (Longitude):</span>
                <p style={{ fontWeight: 600, color: '#FFF', direction: 'ltr', textAlign: 'right' }}>
                  {property.longitude || '—'}
                </p>
              </div>
            </div>

            {/* Map Preview */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <PropertyMap
                mode="viewer"
                latitude={property.latitude}
                longitude={property.longitude}
                properties={[property]}
                height="340px"
              />
            </div>
          </div>

          {/* Section 4: Audit & System History */}
          <div
            className="card"
            style={{
              background: 'var(--bg-surface)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>أضيف بواسطة:</span>{' '}
              <strong style={{ color: '#FFF' }}>{property.createdByName || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>تاريخ الإضافة:</span>{' '}
              <strong style={{ color: '#FFF' }}>{formatDate(property.listingDate || property.createdAt)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>تاريخ الاستلام / الجاهزية:</span>{' '}
              <strong style={{ color: '#FFF' }}>{property.deliveryDate || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>آخر تعديل:</span>{' '}
              <strong style={{ color: '#FFF' }}>{property.updatedByName || '—'}</strong>{' '}
              {property.updatedAt && (
                <span style={{ color: 'var(--text-muted)' }}>({formatDate(property.updatedAt)})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
