import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** If true, the sheet covers the full screen with a glass surface. */
  fullScreen?: boolean;
};

export function Sheet({ open, onClose, children, fullScreen = false }: SheetProps) {
  const t = useTheme();
  const reduce = useReduceMotion();
  return (
    <Modal
      visible={open}
      transparent
      animationType={reduce ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: fullScreen ? 'center' : 'flex-end',
        }}
      >
        <Pressable onPress={() => undefined} style={{ width: '100%' }}>
          <GlassCard
            intensity="strong"
            radius={fullScreen ? 'xl' : 'xl'}
            borderTone="strong"
            style={{
              borderBottomLeftRadius: fullScreen ? radius.xl : 0,
              borderBottomRightRadius: fullScreen ? radius.xl : 0,
              marginHorizontal: fullScreen ? spacing['4'] : 0,
              padding: spacing['6'],
              backgroundColor: t.surface,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: radius.full,
                backgroundColor: t.border,
                marginBottom: spacing['4'],
              }}
            />
            {children}
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
