'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import PropertyMap from '@/components/map/PropertyMap';
import { getProperties } from '@/services/propertyService';
import { Property, PropertyFilterParams } from '@/types/property';
import { MapPin, Filter, RotateCcw, Building2, Loader2 } from 'lucide-react';
import { PURPOSE_LABELS, STATUS_LABELS } from '@/lib/utils/formatters';

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilterParams>({});

  const fetchMapProperties = async () => {
    setLoading(true);
    try {
      const res = await getProperties(filters, 200);
      setProperties(res.properties);
    } catch (err) {
      console.error('Failed to load map properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapProperties();
  }, [filters]);

  const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude);

  return (
    <AppShell>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={26} color="var(--primary)" />
              خريطة العقارات والمواقع الجغرافية
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              استعراض مواقع العقارات المعتمدة على الخريطة التفاعلية ({propertiesWithCoords.length} عقار بإحداثيات مسجلة)
            </p>
          </div>

          {/* Quick Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filters.purpose || ''}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value || undefined })}
              className="form-select"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <option value="">جميع الأغراض</option>
              {Object.keys(PURPOSE_LABELS).map((k) => (
                <option key={k} value={k}>
                  {PURPOSE_LABELS[k as keyof typeof PURPOSE_LABELS].ar}
                </option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="form-select"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <option value="">جميع الحالات</option>
              {Object.keys(STATUS_LABELS).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s as keyof typeof STATUS_LABELS].ar}
                </option>
              ))}
            </select>

            {(filters.purpose || filters.status) && (
              <button
                onClick={() => setFilters({})}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--danger)' }}
              >
                <RotateCcw size={14} />
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Map Container */}
        {loading ? (
          <div
            className="card"
            style={{
              height: '75vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>جاري تحميل الخريطة والمواقع...</span>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: '8px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <PropertyMap
              mode="viewer"
              properties={propertiesWithCoords}
              height="75vh"
              initialZoom={12}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
