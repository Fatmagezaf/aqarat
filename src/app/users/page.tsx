'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, UserRole } from '@/types/user';
import { getAllUsers, createOrUpdateUserProfile } from '@/services/userService';
import { ShieldCheck, UserCheck, Eye, Users, UserPlus, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getAllUsers();
        setUsers(list);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSuccessMsg(null);
    try {
      const targetUser = users.find((u) => u.uid === userId);
      if (targetUser) {
        const updated = { ...targetUser, role: newRole };
        await createOrUpdateUserProfile(updated);
        setUsers(users.map((u) => (u.uid === userId ? updated : u)));
        setSuccessMsg(`تم تحديث صلاحية المستخدم (${targetUser.displayName}) إلى ${newRole === 'admin' ? 'مدير' : newRole === 'agent' ? 'وكيل' : 'مشاهد'}`);
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="card" style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>صفحة مخصصة لمدير النظام فقط</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            يتطلب الوصول إلى إدارة المستخدمين والصلاحيات صلاحية Admin.
          </p>
          <Link href="/" className="btn btn-primary">
            العودة للرئيسية
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={26} color="var(--primary)" />
              إدارة المستخدمين والصلاحيات
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              التحكم في أدوار وصلاحيات موظفي الشركة (Admin, Agent, Viewer)
            </p>
          </div>
        </div>

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              background: 'var(--success-subtle)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: '#6EE7B7',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Roles explanation card */}
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="#EF4444" />
              <strong style={{ color: '#FCA5A5' }}>مدير النظام (Admin)</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              صلاحيات كاملة: إضافة وتعديل وحذف العقارات، إدارة حسابات المستخدمين، وتعديل إعدادات النظام.
            </p>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <UserCheck size={18} color="#3B82F6" />
              <strong style={{ color: '#93C5FD' }}>وكيل مبيعات (Agent)</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              صلاحيات تشغيلية: إضافة عقارات جديدة، تعديل العقارات، استعراض الخرائط والبحث، وتصفية البيانات.
            </p>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Eye size={18} color="#9CA3AF" />
              <strong style={{ color: '#D1D5DB' }}>مشاهد (Viewer)</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              صلاحيات استعراض فقط: البحث وعرض العقارات على الخريطة دون إمكانية التعديل أو الحذف، مع حجب أرقام العملاء.
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الاسم الكامل</th>
                  <th>البريد الإلكتروني</th>
                  <th>رقم الهاتف</th>
                  <th>الصلاحية الحالية</th>
                  <th>تعديل الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{u.displayName}</strong>
                    </td>
                    <td dir="ltr" style={{ textAlign: 'right' }}>
                      {u.email}
                    </td>
                    <td dir="ltr" style={{ textAlign: 'right' }}>
                      {u.phone || '—'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'badge-danger'
                            : u.role === 'agent'
                            ? 'badge-primary'
                            : 'badge-secondary'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدير النظام' : u.role === 'agent' ? 'مسؤول مبيعات' : 'مشاهد'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="form-select"
                        style={{ padding: '4px 10px', fontSize: '0.825rem', width: 'auto' }}
                      >
                        <option value="admin">Admin (مدير)</option>
                        <option value="agent">Agent (وكيل)</option>
                        <option value="viewer">Viewer (مشاهد)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
