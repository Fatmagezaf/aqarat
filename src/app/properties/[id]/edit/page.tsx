'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import PropertyForm from '@/components/properties/PropertyForm';
import { getPropertyById } from '@/services/propertyService';
import { Property } from '@/types/property';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { canEdit } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!propertyId) return;
      setLoading(true);
      try {
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        console.error('Failed to load property for edit:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  if (!canEdit) {
    return (
      <AppShell>
        <div className="card" style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>غير مصرح لك بتعديل العقارات</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            حسابك مسجل بصلاحية مشاهد (Viewer). يرجى التواصل مع مدير النظام للحصول على صلاحية وكيل أو مدير.
          </p>
          <Link href="/properties" className="btn btn-primary">
            العودة لقائمة العقارات
          </Link>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '14px' }}>
          <Loader2 size={36} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>جاري تحميل بيانات العقار للتعديل...</span>
        </div>
      </AppShell>
    );
  }

  if (!property) {
    return (
      <AppShell>
        <div className="card" style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>العقار غير موجود</h2>
          <Link href="/properties" className="btn btn-primary" style={{ marginTop: '16px' }}>
            العودة للقائمة
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PropertyForm initialData={property} isEdit={true} />
    </AppShell>
  );
}
