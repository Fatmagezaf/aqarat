'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, UserCheck, Eye, Loader2 } from 'lucide-react';
import { UserRole } from '@/types/user';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.');
      } else if (err.code === 'auth/user-not-found') {
        setError('لا يوجد حساب مسجل بهذا البريد الإلكتروني.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    router.push('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at top, #131E35 0%, #080B11 75%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting effects */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 10,
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              marginBottom: '16px',
            }}
          >
            <Building2 size={36} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            نظام إدارة العقارات الداخلي
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            قاعدة بيانات خاصة بالعقارات للمستخدمين المصرح لهم فقط
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'var(--danger-subtle)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="name@company.com"
              dir="ltr"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', height: '44px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                جاري التحقق...
              </>
            ) : (
              <>
                تسجيل الدخول
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginBottom: '12px',
              fontWeight: 600,
            }}
          >
            أو تسجيل الدخول السريع (للتجربة والتقييم الفوري):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={16} color="#EF4444" />
              <span>دخول كـ <strong>مدير النظام (Admin)</strong> - صلاحيات كاملة</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('agent')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <UserCheck size={16} color="#3B82F6" />
              <span>دخول كـ <strong>مسؤول مبيعات (Agent)</strong> - إضافة وتعديل</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('viewer')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Eye size={16} color="#9CA3AF" />
              <span>دخول كـ <strong>مشاهد (Viewer)</strong> - استعراض فقط</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
