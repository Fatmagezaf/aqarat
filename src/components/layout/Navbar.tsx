'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Database, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase/config';

export default function Navbar() {
  const router = useRouter();
  const { canEdit, isDemoMode } = useAuth();
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/properties?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const todayStr = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="app-header">
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          width: '380px',
          maxWidth: '100%',
        }}
      >
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="بحث سريع برقم الكود، العنوان، أو الموقع..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-arabic)',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />
      </form>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Date Display */}
        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {todayStr}
        </div>

        {/* System Connection Badge */}
        {isFirebaseConfigured ? (
          <span className="badge badge-success" title="متصل بقاعدة بيانات Firebase المباشرة">
            <Database size={13} />
            Firebase متصل
          </span>
        ) : (
          <span className="badge badge-warning" title="قيد التشغيل بنمط العرض التفاعلي / تجريبي">
            <Sparkles size={13} />
            نمط تفاعلي تجريبي
          </span>
        )}

        {/* Add Property Button */}
        {canEdit && (
          <button
            onClick={() => router.push('/properties/new')}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            إضافة عقار
          </button>
        )}
      </div>
    </header>
  );
}
