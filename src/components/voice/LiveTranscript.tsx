import React from 'react';
import { Text } from '@/components/primitives';

export type LiveTranscriptProps = { text: string };

export function LiveTranscript({ text }: LiveTranscriptProps) {
  if (!text) return null;
  return (
    <Text variant="h3" tone="muted" style={{ textAlign: 'center' }}>
      “{text}”
    </Text>
  );
}
