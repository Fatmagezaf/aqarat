'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { getDashboardStats, getProperties } from '@/services/propertyService';
import { DashboardStats } from '@/services/propertyService';
import { Property } from '@/types/property';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatArea, formatDate, PURPOSE_LABELS, STATUS_LABELS } from '@/lib/utils/formatters';
import {
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { userProfile, canEdit } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsData, propsData] = await Promise.all([
          getDashboardStats(),
          getProperties({ sortBy: 'createdAt', sortOrder: 'desc' }, 6),
        ]);
        setStats(statsData);
        setRecentProperties(propsData.properties);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <AppShell>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid var(--border-medium)',
            padding: '28px 32px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-primary">لوحة التحكم المركزية</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>نظام العقارات الخاص</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
              مرحباً بك، {userProfile?.displayName || 'المستخدم'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              قاعدة بيانات متكاملة لحفظ، بحث، ومتابعة كافة الوحدات العقارية وإحداثياتها الجغرافية.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/map" className="btn btn-secondary">
              <MapPin size={18} />
              استعراض الخريطة
            </Link>
            {canEdit && (
              <Link href="/properties/new" className="btn btn-primary">
                <Plus size={18} />
                إضافة عقار جديد
              </Link>
            )}
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {/* Total Properties */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>إجمالي العقارات</span>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA' }}>
                <Building2 size={22} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF' }}>
              {loading ? '—' : stats?.total}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              مسجلة في قاعدة البيانات
            </div>
          </div>

          {/* Available Units */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>عقارات متاحة</span>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34D399' }}>
              {loading ? '—' : stats?.available}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              جاهزة للعرض والتعاقد
            </div>
          </div>

          {/* Ready For Delivery */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>جاهز للتسليم الفوري</span>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--warning-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBBF24' }}>
                <Clock size={22} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FBBF24' }}>
              {loading ? '—' : stats?.readyForDelivery}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              استلام فوري / فوري ومفروش
            </div>
          </div>

          {/* Featured Properties */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>عقارات مميزة (علامة)</span>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--accent-purple-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                <Sparkles size={22} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#A78BFA' }}>
              {loading ? '—' : stats?.featured}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              مدرجة كفرص ذهبية
            </div>
          </div>
        </div>

        {/* Locations Breakdown & Quick Action shortcuts */}
        {stats && Object.keys(stats.locationsCount).length > 0 && (
          <div className="card" style={{ marginBottom: '28px', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary)" />
              توزيع العقارات جغرافياً حسب المنطقة
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(stats.locationsCount).map(([loc, count]) => (
                <Link
                  key={loc}
                  href={`/properties?search=${encodeURIComponent(loc)}`}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <span>{loc}</span>
                  <span className="badge badge-primary" style={{ padding: '2px 8px' }}>
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added Properties Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>أحدث العقارات المضافة</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                آخر العقارات التي تم تسجيلها وتحديثها مؤخراً
              </p>
            </div>

            <Link href="/properties" className="btn btn-outline btn-sm">
              عرض كل العقارات ({stats?.total || 0})
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '8px' }}></th>
                  <th>الكود</th>
                  <th>العنوان</th>
                  <th>المنطقة</th>
                  <th>المبلغ</th>
                  <th>المساحة</th>
                  <th>الغرض</th>
                  <th>الحالة</th>
                  <th>بواسطة</th>
                  <th>التاريخ</th>
                  <th style={{ textAlign: 'center' }}>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((p) => {
                  const purposeInfo = PURPOSE_LABELS[p.purpose] || { ar: p.purpose, color: '#9CA3AF' };
                  const statusInfo = STATUS_LABELS[p.status] || { ar: p.status, badgeClass: 'badge-secondary' };

                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '14px 4px', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '6px',
                            height: '28px',
                            borderRadius: '3px',
                            backgroundColor: p.colorTag || '#3B82F6',
                          }}
                        />
                      </td>
                      <td>
                        <Link href={`/properties/${p.id}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {p.code}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.address}</div>
                      </td>
                      <td>{p.locationName}</td>
                      <td style={{ fontWeight: 700, color: '#34D399' }}>{formatCurrency(p.price)}</td>
                      <td>{formatArea(p.area)}</td>
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
                      <td>
                        <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.ar}</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {p.createdByName || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(p.listingDate || p.createdAt)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link href={`/properties/${p.id}`} className="btn btn-outline btn-sm btn-icon">
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
