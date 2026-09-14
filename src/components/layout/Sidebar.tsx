'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MapPin,
  Users,
  LogOut,
  ShieldCheck,
  UserCheck,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile, logout, isAdmin, switchDemoRole, isDemoMode } = useAuth();

  const navItems = [
    {
      title: 'لوحة التحكم',
      href: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'قاعدة العقارات',
      href: '/properties',
      icon: <Building2 size={20} />,
    },
    {
      title: 'إضافة عقار',
      href: '/properties/new',
      icon: <PlusCircle size={20} />,
    },
    {
      title: 'خريطة العقارات',
      href: '/map',
      icon: <MapPin size={20} />,
    },
  ];

  if (isAdmin) {
    navItems.push({
      title: 'المستخدمين والصلاحيات',
      href: '/users',
      icon: <Users size={20} />,
    });
  }

  const roleTitle: Record<UserRole, { label: string; class: string; icon: React.ReactNode }> = {
    admin: { label: 'مدير النظام (Admin)', class: 'badge-danger', icon: <ShieldCheck size={14} /> },
    agent: { label: 'مسؤول مبيعات (Agent)', class: 'badge-primary', icon: <UserCheck size={14} /> },
    viewer: { label: 'مشاهد (Viewer)', class: 'badge-secondary', icon: <Eye size={14} /> },
  };

  const currentRole = userProfile?.role || 'viewer';

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
              إدارة العقارات
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real Estate CRM</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher & User Profile Box */}
      <div
        style={{
          padding: '16px',
          margin: '12px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#FFF',
            }}
          >
            {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userProfile?.displayName || 'المستخدم'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {userProfile?.email || 'authenticated'}
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`badge ${roleTitle[currentRole].class}`}>
            {roleTitle[currentRole].icon}
            {roleTitle[currentRole].label}
          </span>
        </div>

        {/* Role Quick Switcher for Testing / Evaluation */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <div
            style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <SlidersHorizontal size={12} />
            تبديل الصلاحية للتجربة:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {(['admin', 'agent', 'viewer'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchDemoRole(r)}
                style={{
                  padding: '4px 2px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: currentRole === r ? 'var(--primary)' : 'var(--border-subtle)',
                  background: currentRole === r ? 'var(--primary-subtle)' : 'transparent',
                  color: currentRole === r ? '#60A5FA' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {r === 'admin' ? 'مدير' : r === 'agent' ? 'وكيل' : 'مشاهد'}
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)' }}
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
