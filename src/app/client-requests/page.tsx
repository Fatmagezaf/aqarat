'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { ClientRequest, RequestArea, RequestPurpose } from '@/types/clientRequest';
import { getClientRequests, createClientRequest, updateClientRequest, deleteClientRequest } from '@/services/clientRequestService';
import { ClipboardList, PlusCircle, Loader2, Save, Trash2, MapPin, Ruler, Phone, CheckCircle2, RefreshCw } from 'lucide-react';

const AREAS: RequestArea[] = ['B1', 'B2', 'B3', 'B6', 'B7', 'B8', 'B10', 'B11', 'B12', 'B14', 'B15', 'Privado'];
const PURPOSES: RequestPurpose[] = ['شراء قسط', 'شراء كاش', 'إيجار قانون', 'إيجار مفروش'];

export default function ClientRequestsPage() {
  const { user, userProfile } = useAuth();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [area, setArea] = useState<RequestArea>('B1');
  const [size, setSize] = useState<number | ''>('');
  const [purpose, setPurpose] = useState<RequestPurpose>('شراء كاش');
  const [notes, setNotes] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getClientRequests(filterStatus ? { status: filterStatus } : {});
      setRequests(data);
    } catch (err) {
      console.error('Failed to load client requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !size) return;

    setSubmitting(true);
    try {
      const newReq = await createClientRequest(
        {
          clientName,
          clientPhone,
          area,
          size: Number(size),
          purpose,
          notes,
          status: 'new',
        },
        { uid: user?.uid || 'user', displayName: userProfile?.displayName || 'Unknown' }
      );
      setRequests([newReq, ...requests]);
      setShowAddForm(false);
      
      // Reset form
      setClientName('');
      setClientPhone('');
      setSize('');
      setNotes('');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('حدث خطأ أثناء حفظ الطلب.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateClientRequest(id, { status: newStatus });
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Update status failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await deleteClientRequest(id);
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={26} color="var(--primary)" />
              طلبات العملاء
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              إدارة طلبات واحتياجات العملاء الخاصة بالعقارات
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showAddForm ? 'إلغاء' : <><PlusCircle size={18} /> إضافة طلب جديد</>}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>إضافة طلب عميل جديد</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">اسم العميل *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">رقم التليفون *</label>
                  <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="form-input" required dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">المنطقة *</label>
                  <select value={area} onChange={e => setArea(e.target.value as RequestArea)} className="form-select">
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">المساحة المطلوبة (م²) *</label>
                  <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} className="form-input" required dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">الغرض *</label>
                  <select value={purpose} onChange={e => setPurpose(e.target.value as RequestPurpose)} className="form-select">
                    {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ملاحظات إضافية</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="form-input" placeholder="اختياري" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" size={18} /> : <Save size={18} />} حفظ الطلب
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '200px' }}>
            <option value="">جميع الحالات</option>
            <option value="new">جديد</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spin" size={32} color="var(--primary)" /></div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            لا توجد طلبات تطابق بحثك حالياً.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map(req => (
              <div key={req.id} className="card" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.clientName}
                    <span className={`badge ${req.status === 'new' ? 'badge-primary' : req.status === 'completed' ? 'badge-success' : 'badge-secondary'}`}>
                      {req.status === 'new' ? 'جديد' : req.status === 'in_progress' ? 'قيد التنفيذ' : req.status === 'completed' ? 'مكتمل' : 'ملغي'}
                    </span>
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14}/> {req.clientPhone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {req.area}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Ruler size={14}/> {req.size} م²</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: 'var(--primary)' }}>{req.purpose}</span>
                  </div>
                  {req.notes && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', padding: '8px', borderRadius: '4px' }}>
                      {req.notes}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    أضيف بواسطة: {req.createdByName} | بتاريخ: {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString('ar-EG') : 'الآن'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select 
                    value={req.status} 
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="form-select" 
                    style={{ fontSize: '0.8rem', padding: '4px 8px', width: '130px' }}
                  >
                    <option value="new">جديد</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <button onClick={() => handleDelete(req.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger-subtle)' }}>
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
