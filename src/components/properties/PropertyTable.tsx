'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit2, Trash2, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency, formatArea, formatDate, PURPOSE_LABELS, STATUS_LABELS } from '@/lib/utils/formatters';
import { useAuth } from '@/context/AuthContext';

interface PropertyTableProps {
  properties: Property[];
  onDelete?: (id: string) => void;
}

export default function PropertyTable({ properties, onDelete }: PropertyTableProps) {
  const { canEdit, canDelete } = useAuth();
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const confirmDelete = () => {
    if (propertyToDelete && onDelete) {
      onDelete(propertyToDelete.id);
      setPropertyToDelete(null);
    }
  };

  if (properties.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
        }}
      >
        <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>لا توجد عقارات مطابقة لمعايير البحث الحالية.</p>
        <p style={{ fontSize: '0.85rem' }}>جرب تعديل أو إزالة بعض الفلاتر لعرض النتائج.</p>
      </div>
    );
  }

  return (
    <>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '12px', padding: '14px 6px' }}></th>
              <th>الكود</th>
              <th>العنوان / الوحدة</th>
              <th>المنطقة</th>
              <th>المبلغ</th>
              <th>المساحة</th>
              <th>الغرف</th>
              <th>الغرض</th>
              <th>الحالة</th>
              <th>بواسطة</th>
              <th>التاريخ</th>
              <th style={{ textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => {
              const purposeInfo = PURPOSE_LABELS[property.purpose] || { ar: property.purpose, color: '#9CA3AF' };
              const statusInfo = STATUS_LABELS[property.status] || { ar: property.status, badgeClass: 'badge-secondary' };

              return (
                <tr key={property.id}>
                  {/* Color tag indicator */}
                  <td style={{ padding: '14px 6px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '32px',
                        borderRadius: '4px',
                        backgroundColor: property.colorTag || '#3B82F6',
                      }}
                      title={property.colorTag}
                    />
                  </td>

                  {/* Code */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Link
                        href={`/properties/${property.id}`}
                        style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}
                      >
                        {property.code}
                      </Link>
                      {property.isFeatured && (
                        <span title="عقار مميز" style={{ display: 'inline-flex' }}>
                          <Sparkles size={14} color="#F59E0B" />
                        </span>
                      )}
                    </div>
                    {property.phase && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        مرحلة: {property.phase}
                      </span>
                    )}
                  </td>

                  {/* Address */}
                  <td>
                    <div style={{ fontWeight: 600 }}>{property.address}</div>
                    {property.model && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        نموذج: {property.model}
                      </div>
                    )}
                  </td>

                  {/* Location */}
                  <td>
                    <span style={{ fontWeight: 500 }}>{property.locationName}</span>
                  </td>

                  {/* Price */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#34D399', whiteSpace: 'nowrap' }}>
                      {formatCurrency(property.price)}
                    </div>
                    {property.pricePerMeter ? (
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {formatCurrency(property.pricePerMeter, 'متر')}
                      </div>
                    ) : null}
                  </td>

                  {/* Area */}
                  <td>
                    <span>{formatArea(property.area)}</span>
                  </td>

                  {/* Rooms */}
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span>{property.bedrooms ?? '—'} نوم</span>
                      <span style={{ color: 'var(--text-muted)' }}> / </span>
                      <span>{property.bathrooms ?? '—'} حمام</span>
                    </div>
                  </td>

                  {/* Purpose */}
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${purposeInfo.color}15`,
                        color: purposeInfo.color,
                        border: `1px solid ${purposeInfo.color}35`,
                      }}
                    >
                      {purposeInfo.ar}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${statusInfo.badgeClass}`}>
                      {statusInfo.ar}
                    </span>
                  </td>

                  {/* Added By */}
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {property.createdByName || '—'}
                    </span>
                  </td>

                  {/* Date */}
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(property.listingDate || property.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {/* View */}
                      <Link
                        href={`/properties/${property.id}`}
                        className="btn btn-outline btn-sm btn-icon"
                        title="عرض التفاصيل"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Map link */}
                      {property.locationUrl ? (
                        <a
                          href={property.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm btn-icon"
                          title="فتح في خرائط Google"
                        >
                          <ExternalLink size={15} color="#3B82F6" />
                        </a>
                      ) : property.latitude && property.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm btn-icon"
                          title="موقع الخريطة"
                        >
                          <MapPin size={15} color="#3B82F6" />
                        </a>
                      ) : null}

                      {/* Edit */}
                      {canEdit && (
                        <Link
                          href={`/properties/${property.id}/edit`}
                          className="btn btn-outline btn-sm btn-icon"
                          title="تعديل العقار"
                        >
                          <Edit2 size={15} color="#F59E0B" />
                        </Link>
                      )}

                      {/* Delete */}
                      {canDelete && onDelete && (
                        <button
                          type="button"
                          onClick={() => setPropertyToDelete(property)}
                          className="btn btn-outline btn-sm btn-icon"
                          title="حذف العقار"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--danger)' }}>
              تأكيد حذف العقار
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              هل أنت متأكد من رغبتك في حذف العقار كود{' '}
              <strong style={{ color: '#FFF' }}>{propertyToDelete.code}</strong> (العنوان:{' '}
              {propertyToDelete.address}) نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذه العملية.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="btn btn-secondary"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-danger"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
