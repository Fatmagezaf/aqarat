'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Maximize2, Bed, Bath, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Property } from '@/types/property';
import { formatCurrency, formatArea, PURPOSE_LABELS, STATUS_LABELS } from '@/lib/utils/formatters';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const purposeInfo = PURPOSE_LABELS[property.purpose] || { ar: property.purpose, color: '#9CA3AF' };
  const statusInfo = STATUS_LABELS[property.status] || { ar: property.status, badgeClass: 'badge-secondary' };

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Color tag top ribbon */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: '4px',
          backgroundColor: property.colorTag || '#3B82F6',
        }}
      />

      {/* Card Header: Code, Badges */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFF' }}>{property.code}</span>
            {property.isFeatured && (
              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                <Sparkles size={11} /> مميز
              </span>
            )}
          </div>
          <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.ar}</span>
        </div>

        {/* Address & Location */}
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {property.address}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            <MapPin size={14} color="var(--primary)" />
            <span>{property.locationName}</span>
            {property.phase && <span>• مرحلة {property.phase}</span>}
          </div>
        </div>

        {/* Price Box */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>المبلغ:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
              {formatCurrency(property.price)}
            </div>
          </div>
          <span
            className="badge"
            style={{
              backgroundColor: `${purposeInfo.color}18`,
              color: purposeInfo.color,
              border: `1px solid ${purposeInfo.color}35`,
            }}
          >
            {purposeInfo.ar}
          </span>
        </div>

        {/* Specs: Area, Bedrooms, Bathrooms */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '10px 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Maximize2 size={14} color="var(--text-muted)" />
            <span>{formatArea(property.area)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bed size={14} color="var(--text-muted)" />
            <span>{property.bedrooms ? `${property.bedrooms} نوم` : '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bath size={14} color="var(--text-muted)" />
            <span>{property.bathrooms ? `${property.bathrooms} حمام` : '—'}</span>
          </div>
        </div>

        {/* Landmark or Delivery preview */}
        {property.landmark && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <strong>معلم بارز:</strong> {property.landmark}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Link
          href={`/properties/${property.id}`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, textAlign: 'center' }}
        >
          عرض العقار
          <ArrowUpRight size={14} />
        </Link>

        {property.locationUrl && (
          <a
            href={property.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm btn-icon"
            title="فتح في Google Maps"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
