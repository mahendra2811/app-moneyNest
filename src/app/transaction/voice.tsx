import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Button } from '@/components/primitives';
import { MicButton } from '@/components/voice/MicButton';
import { LiveTranscript } from '@/components/voice/LiveTranscript';
import { ParsePreview } from '@/components/voice/ParsePreview';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { voiceService } from '@/platform/voice';
import { parseUtterance, type ParseResult } from '@/lib/voice-parser';
import { useCategories } from '@/hooks/use-categories';
import { useAccounts } from '@/hooks/use-accounts';
import { createTransaction } from '@/db/queries/transactions';
import { useInvalidateStore } from '@/stores/invalidate';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { now, addDays } from '@/lib/date';

type State = 'idle' | 'listening' | 'parsed' | 'error';

export default function VoiceAdd() {
  const router = useRouter();
  const showToast = useUiStore((s) => s.showToast);
  const bumpTx = useInvalidateStore((s) => s.bumpTransactions);
  const session = useSessionStore();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      unsubRef.current?.();
      voiceService.cancel().catch(() => undefined);
    };
  }, []);

  const startListening = async () => {
    setTranscript('');
    setResult(null);
    setState('listening');
    const ok = await voiceService.requestPermission();
    if (!ok) {
      setState('error');
      setErrorMsg(t('errors.micPermissionDenied'));
      return;
    }
    const available = await voiceService.isAvailable();
    if (!available) {
      setState('error');
      setErrorMsg(t('voice.unsupportedBody'));
      return;
    }
    unsubRef.current = voiceService.subscribe((ev) => {
      if (ev.type === 'partial') setTranscript(ev.result.transcript);
      else if (ev.type === 'final') {
        setTranscript(ev.result.transcript);
        const parsed = parseUtterance(ev.result.transcript);
        setResult(parsed);
        setState('parsed');
      } else if (ev.type === 'error') {
        setState('error');
        setErrorMsg(ev.message);
      }
    });
    try {
      await voiceService.start({ locale: 'en-IN', preferOffline: true });
    } catch (e) {
      setState('error');
      setErrorMsg((e as Error).message);
    }
  };

  const stopListening = async () => {
    await voiceService.stop();
  };

  const resolveCategoryId = (slug: string | null): string | null => {
    if (!slug || !categories) return null;
    const exact = categories.find((c) => c.slug === slug || c.name.toLowerCase() === slug);
    return exact?.id ?? null;
  };

  const saveParsed = async () => {
    if (!result || result.amountPaise === null) return;
    if (!accounts || accounts.length === 0) return;
    const accId = session.lastAccountId ?? accounts[0]!.id;
    const catId =
      result.type === 'transfer' ? null : resolveCategoryId(result.categorySlug);
    const occurred =
      result.dateHint === 'yesterday'
        ? addDays(now(), -1)
        : result.dateHint === 'parso'
          ? addDays(now(), -2)
          : now();
    await createTransaction({
      amountPaise: result.amountPaise,
      type: result.type,
      accountId: accId,
      toAccountId: null,
      categoryId: catId,
      occurredAt: occurred,
      note: result.raw,
      payee: result.payee ?? null,
      source: 'voice',
      deletedAt: null,
      recurringId: null,
    });
    bumpTx();
    showToast({ tone: 'success', text: t('transactions.savedToast') });
    router.back();
  };

  const tryAgain = () => {
    setResult(null);
    setTranscript('');
    setErrorMsg('');
    setState('idle');
  };

  const resolvedCategory =
    result?.categorySlug
      ? categories?.find((c) => c.slug === result.categorySlug || c.name.toLowerCase() === result.categorySlug) ?? null
      : null;
  const resolvedAccount = accounts?.find((a) => a.id === session.lastAccountId) ?? accounts?.[0] ?? null;

  return (
    <AppShell>
      <ScreenHeader title="Voice" />
      <View style={{ flex: 1, padding: spacing['4'], justifyContent: 'center', gap: spacing['6'] }}>
        {state === 'idle' || state === 'listening' ? (
          <>
            <LiveTranscript text={transcript || (state === 'listening' ? t('voice.listening') : '')} />
            <View style={{ alignItems: 'center' }}>
              <MicButton
                listening={state === 'listening'}
                onPressIn={startListening}
                onPressOut={stopListening}
              />
            </View>
            <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
              {state === 'listening' ? t('voice.releaseToSend') : t('voice.holdToTalk')}
            </Text>
          </>
        ) : null}

        {state === 'parsed' && result ? (
          result.confidence < 0.4 || result.amountPaise === null ? (
            <View style={{ gap: spacing['4'] }}>
              <Text variant="h2">{t('voice.parseFallbackTitle')}</Text>
              <Text variant="body" tone="muted">
                {t('voice.parseFallbackBody')}
              </Text>
              <Text variant="caption" tone="faint">
                {t('voice.raw')}: “{result.raw}”
              </Text>
              <Button label="Add manually" onPress={() => router.replace('/transaction/new' as never)} />
              <Button label="Try again" variant="secondary" onPress={tryAgain} />
            </View>
          ) : (
            <ParsePreview
              result={result}
              resolvedCategoryName={resolvedCategory?.name ?? null}
              resolvedAccountName={resolvedAccount?.name ?? null}
              onSave={saveParsed}
              onEdit={() => router.replace('/transaction/new' as never)}
              onDiscard={tryAgain}
            />
          )
        ) : null}

        {state === 'error' ? (
          <View style={{ gap: spacing['4'], alignItems: 'center' }}>
            <Text variant="h2" style={{ textAlign: 'center' }}>
              {t('voice.unsupportedTitle')}
            </Text>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
              {errorMsg}
            </Text>
            <Button label="Retry" onPress={tryAgain} />
            <Button label="Add manually" variant="secondary" onPress={() => router.replace('/transaction/new' as never)} />
          </View>
        ) : null}
      </View>
    </AppShell>
  );
}
