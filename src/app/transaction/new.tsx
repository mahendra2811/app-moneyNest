import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { t } from '@/copy';

export default function NewTransaction() {
  return (
    <AppShell>
      <ScreenHeader title={t('transactions.newTitle')} />
      <TransactionForm />
    </AppShell>
  );
}
