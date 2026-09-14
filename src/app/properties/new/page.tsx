'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import PropertyForm from '@/components/properties/PropertyForm';

export default function NewPropertyPage() {
  return (
    <AppShell>
      <PropertyForm />
    </AppShell>
  );
}
