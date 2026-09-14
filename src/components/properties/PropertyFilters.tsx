'use client';

import React from 'react';
import { Filter, RotateCcw, Search, Sparkles } from 'lucide-react';
import { PropertyFilterParams, PropertyPurpose, PropertyStatus } from '@/types/property';
import { PURPOSE_LABELS, STATUS_LABELS, FINISHING_OPTIONS, FLOOR_OPTIONS } from '@/lib/utils/formatters';

interface PropertyFiltersProps {
  filters: PropertyFilterParams;
  onChange: (newFilters: PropertyFilterParams) => void;
  onReset: () => void;
}

export default function PropertyFilters({ filters, onChange, onReset }: PropertyFiltersProps) {
  const updateField = (field: keyof PropertyFilterParams, value: any) => {
    onChange({
      ...filters,
      [field]: value === '' ? undefined : value,
    });
  };

  const hasActiveFilters = Boolean(
    filters.purpose ||
    filters.status ||
    filters.locationName ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea ||
    filters.bedrooms ||
    filters.bathrooms ||
    filters.finishing ||
    filters.floor ||
    filters.isFeatured !== undefined
  );

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        marginBottom: '24px',
        background: 'var(--bg-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>تصفية العقارات المتقدمة</h3>
          {hasActiveFilters && (
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              فلاتر مفعّلة
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <RotateCcw size={14} />
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>

      <div className="grid-4" style={{ gap: '14px' }}>
        {/* Purpose Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>الغرض</label>
          <select
            value={filters.purpose || ''}
            onChange={(e) => updateField('purpose', e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">جميع الأغراض</option>
            {(Object.keys(PURPOSE_LABELS) as PropertyPurpose[]).map((p) => (
              <option key={p} value={p}>
                {PURPOSE_LABELS[p].ar}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>الحالة</label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateField('status', e.target.value)}
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">جميع الحالات</option>
            {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s].ar}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>المنطقة / المدينة</label>
          <input
            type="text"
            value={filters.locationName || ''}
            onChange={(e) => updateField('locationName', e.target.value)}
            placeholder="مثال: مدينتي، التجمع..."
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Bedrooms Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>عدد الغرف (حد أدنى)</label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => updateField('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="">الكل</option>
            <option value="1">غرفة فأكثر</option>
            <option value="2">غرفتان فأكثر</option>
            <option value="3">3 غرف فأكثر</option>
            <option value="4">4 غرف فأكثر</option>
            <option value="5">5 غرف فأكثر</option>
          </select>
        </div>

        {/* Min Price */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>أقل سعر (ج.م)</label>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => updateField('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثال: 10000"
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            dir="ltr"
          />
        </div>

        {/* Max Price */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>أعلى سعر (ج.م)</label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => updateField('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثال: 50000"
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            dir="ltr"
          />
        </div>

        {/* Min Area */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>أقل مساحة (م²)</label>
          <input
            type="number"
            value={filters.minArea || ''}
            onChange={(e) => updateField('minArea', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثال: 70"
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            dir="ltr"
          />
        </div>

        {/* Max Area */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>أعلى مساحة (م²)</label>
          <input
            type="number"
            value={filters.maxArea || ''}
            onChange={(e) => updateField('maxArea', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثال: 200"
            className="form-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            dir="ltr"
          />
        </div>
      </div>

      {/* Featured checkbox filter */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={filters.isFeatured === true}
            onChange={(e) => updateField('isFeatured', e.target.checked ? true : undefined)}
            style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <Sparkles size={16} color="#F59E0B" />
          <span>إظهار العقارات المميزة فقط</span>
        </label>
      </div>
    </div>
  );
}
