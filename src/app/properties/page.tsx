'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import PropertyTable from '@/components/properties/PropertyTable';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { getProperties, deleteProperty } from '@/services/propertyService';
import { Property, PropertyFilterParams } from '@/types/property';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  Sparkles,
} from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { canEdit } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<PropertyFilterParams>({
    search: initialSearch,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadProperties = async (currentFilters: PropertyFilterParams) => {
    setLoading(true);
    try {
      const res = await getProperties(currentFilters, 50);
      setProperties(res.properties);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties(filters);
  }, [filters]);

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, search: val }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      setFilters((prev) => ({ ...prev, sortBy: 'price', sortOrder: 'asc' }));
    } else if (val === 'price_desc') {
      setFilters((prev) => ({ ...prev, sortBy: 'price', sortOrder: 'desc' }));
    } else if (val === 'area_desc') {
      setFilters((prev) => ({ ...prev, sortBy: 'area', sortOrder: 'desc' }));
    } else {
      setFilters((prev) => ({ ...prev, sortBy: 'createdAt', sortOrder: 'desc' }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      loadProperties(filters);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
            قاعدة بيانات العقارات
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            إجمالي العقارات المسجلة: <strong style={{ color: '#FFF' }}>{totalCount}</strong> عقار
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {canEdit && (
            <Link href="/properties/new" className="btn btn-primary">
              <Plus size={18} />
              إضافة عقار جديد
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar & View Controls Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-surface)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flex: '1 1 340px',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="بحث بالكود، العنوان، اسم المالك، الهاتف، أو المعلم..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.9rem',
              width: '100%',
            }}
          />
        </div>

        {/* Action Controls: Filter Toggle, Sort, View mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Filter size={16} />
            الفلاتر المتقدمة
          </button>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              onChange={handleSortChange}
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="newest">الأحدث إضافة</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="area_desc">المساحة: الأكبر أولاً</option>
            </select>
          </div>

          {/* View Toggle (Table / Grid) */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '3px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="عرض الجدول"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="عرض الشبكة"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <PropertyFilters
          filters={filters}
          onChange={(newF) => setFilters(newF)}
          onReset={() => setFilters({ sortBy: 'createdAt', sortOrder: 'desc' })}
        />
      )}

      {/* Content View */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span>جاري تحميل بيانات العقارات...</span>
        </div>
      ) : viewMode === 'table' ? (
        <PropertyTable properties={properties} onDelete={handleDelete} />
      ) : (
        <div className="grid-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>}>
        <PropertiesContent />
      </Suspense>
    </AppShell>
  );
}
