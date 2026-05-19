export const voice = {
  listening: 'Listening…',
  holdToTalk: 'Hold to talk',
  releaseToSend: 'Release to send',
  parsing: 'Got it…',
  parseHigh: 'Looks good?',
  parseTentative: 'Looks right?',
  parseFallbackTitle: "Didn't quite catch that",
  parseFallbackBody: "Tap below to add it manually — we'll pre-fill what we heard.",
  raw: 'You said',
  micPermissionTitle: 'Mic access needed',
  micPermissionBody:
    'moneyNest uses your phone’s on-device speech recognizer. Audio never leaves your phone.',
  unsupportedTitle: 'Voice not supported',
  unsupportedBody:
    'Your device doesn’t support offline speech recognition. You can still add transactions manually.',
} as const;
