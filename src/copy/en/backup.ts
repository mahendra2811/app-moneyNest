export const backup = {
  title: 'Backup',
  exportTitle: 'Export backup',
  exportBody:
    'Encrypted with AES-256-GCM using your passphrase. Store the file somewhere safe.',
  exportCta: 'Export now',
  importTitle: 'Restore backup',
  importBody: 'Choose a backup file. You will be asked for the passphrase.',
  importCta: 'Choose file',
  passphraseLabel: 'Passphrase',
  passphraseHint: 'Minimum 8 characters. We can’t recover this if you lose it.',
  confirmPassphraseLabel: 'Confirm passphrase',
  exportSuccess: 'Backup saved',
  importSuccess: 'Restore complete',
  importMergeTitle: 'Merge or replace?',
  importMergeBody:
    'Merge keeps existing data. Replace wipes everything first.',
  importMergeCta: 'Merge',
  importReplaceCta: 'Replace all',
  wrongPassphrase: 'Wrong passphrase or file is corrupted.',
} as const;
