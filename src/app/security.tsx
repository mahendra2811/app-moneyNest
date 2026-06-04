import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Switch, Chip, Divider } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  setPin,
  isPinSet,
  clearPin,
  getLockTimeout,
  setLockTimeout,
  type LockTimeout,
  isStealth,
  setStealth,
  isScreenshotBlocked,
  setScreenshotBlocked,
  getAppIcon,
  setAppIcon,
  setDecoyPassphrase,
  PRIVACY_RECEIPT,
  buildDiagnostic,
} from '@/lib/security';
import { useUiStore } from '@/stores/ui';
import { filesystemService } from '@/platform/filesystem';

const TIMEOUTS: { label: string; v: LockTimeout }[] = [
  { label: '1m', v: 60 },
  { label: '5m', v: 300 },
  { label: '15m', v: 900 },
  { label: 'Never', v: -1 },
];

export default function SecurityScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [pin, setPinValue] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [timeout, setTimeoutValue] = useState<LockTimeout>(300);
  const [stealth, setStealthState] = useState(false);
  const [block, setBlockState] = useState(false);
  const [icon, setIconState] = useState<'default' | 'calculator'>('default');
  const [decoy, setDecoy] = useState('');

  useEffect(() => {
    (async () => {
      setHasPin(await isPinSet());
      setTimeoutValue(await getLockTimeout());
      setStealthState(await isStealth());
      setBlockState(await isScreenshotBlocked());
      setIconState(await getAppIcon());
    })();
  }, []);

  return (
    <AppShell>
      <ScreenHeader title="Security" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">PIN lock</Text>
          <Text variant="small" tone="muted">{hasPin ? 'A PIN is set.' : 'Add a 4+ digit fallback PIN.'}</Text>
          <View style={{ height: spacing['3'] }} />
          <Input value={pin} onChangeText={setPinValue} keyboardType="number-pad" secureTextEntry placeholder="••••" />
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            <Button
              label={hasPin ? 'Replace PIN' : 'Set PIN'}
              fullWidth
              onPress={async () => {
                try {
                  await setPin(pin);
                  setHasPin(true);
                  setPinValue('');
                  showToast({ tone: 'success', text: 'PIN saved' });
                } catch (e) {
                  showToast({ tone: 'error', text: (e as Error).message });
                }
              }}
            />
            {hasPin ? (
              <Button
                label="Remove"
                variant="ghost"
                onPress={async () => {
                  await clearPin();
                  setHasPin(false);
                }}
              />
            ) : null}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Auto-lock</Text>
          <Text variant="small" tone="muted">Lock after the app goes to background for this long.</Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
            {TIMEOUTS.map((t) => (
              <Chip
                key={t.label}
                label={t.label}
                selected={timeout === t.v}
                onPress={() => {
                  setTimeoutValue(t.v);
                  setLockTimeout(t.v);
                }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Stealth + screenshot block</Text>
          <View style={{ height: spacing['3'] }} />
          <Row label="Hide app from recents (FLAG_SECURE)">
            <Switch value={stealth} onValueChange={(v) => { setStealthState(v); setStealth(v); }} />
          </Row>
          <Divider style={{ marginVertical: spacing['3'] }} />
          <Row label="Block screenshots inside the app">
            <Switch value={block} onValueChange={(v) => { setBlockState(v); setScreenshotBlocked(v); }} />
          </Row>
        </Card>

        <Card>
          <Text variant="h3">App icon</Text>
          <Text variant="small" tone="muted">Disguise as a Calculator. Effective after restart (activity-alias native flip).</Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
            {(['default', 'calculator'] as const).map((k) => (
              <Chip key={k} label={k} selected={icon === k} onPress={() => { setIconState(k); setAppIcon(k); }} />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Decoy passphrase</Text>
          <Text variant="small" tone="muted">A separate passphrase that opens a sanitized view. Tap once to set; we never show it again.</Text>
          <View style={{ height: spacing['3'] }} />
          <Input value={decoy} onChangeText={setDecoy} secureTextEntry placeholder="••••••••" />
          <View style={{ height: spacing['3'] }} />
          <Button
            label="Save decoy"
            fullWidth
            onPress={async () => {
              if (decoy.length < 8) {
                showToast({ tone: 'error', text: '8+ characters' });
                return;
              }
              await setDecoyPassphrase(decoy);
              setDecoy('');
              showToast({ tone: 'success', text: 'Decoy saved' });
            }}
          />
        </Card>

        <Card>
          <Text variant="h3">Diagnostic export</Text>
          <Text variant="small" tone="muted">Non-PII snapshot for support tickets. Never includes amounts or notes.</Text>
          <View style={{ height: spacing['3'] }} />
          <Button
            label="Export diagnostic JSON"
            variant="secondary"
            fullWidth
            onPress={async () => {
              const text = await buildDiagnostic();
              const base64 = typeof btoa === 'function' ? btoa(text) : Buffer.from(text).toString('base64');
              await filesystemService.saveFile({ suggestedName: 'moneynest-diag.json', base64, mimeType: 'application/json' });
              showToast({ tone: 'success', text: 'Diagnostic saved' });
            }}
          />
        </Card>

        <Card>
          <Text variant="h3">Privacy receipt</Text>
          <Text variant="small" tone="muted">Inventory of what's stored where.</Text>
          <View style={{ height: spacing['3'] }} />
          {PRIVACY_RECEIPT.map((r, i) => (
            <View key={i} style={{ paddingVertical: spacing['2'], borderTopWidth: i === 0 ? 0 : 1, borderColor: '#E2E8F0' }}>
              <Text variant="bodyMed">{r.what}</Text>
              <Text variant="caption" tone={r.encrypted ? 'income' : 'muted'}>
                {r.where} · {r.encrypted ? 'encrypted' : 'plain'}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="bodyMed" style={{ flex: 1, paddingRight: spacing['4'] }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
