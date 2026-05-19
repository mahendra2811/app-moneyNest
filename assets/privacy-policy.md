# moneyNest — Privacy Policy

_Last updated: 2026-05-19_

moneyNest is a personal finance tracker designed to keep your data on
your device. This policy explains exactly what we collect, what we
don't, and the rights you have under India's Digital Personal Data
Protection Act, 2023 (DPDP Act).

## 1. What we collect

**By default, nothing leaves your phone.** All transactions, accounts,
categories, budgets, recurring entries, and settings live in an
on-device SQLite database.

You may explicitly opt in (from Settings → Privacy) to:

- **Anonymous usage analytics** — event names and timestamps only
  (e.g. `transaction_created`, `report_viewed`). No amounts, no notes,
  no payees. Powered by PostHog (EU region).
- **Crash reports** — automatic stack traces and device model when the
  app crashes. Powered by Sentry. No transaction data is included.

Both toggles are **off by default**. Turning them off later stops all
future collection.

## 2. What we never collect

- Bank account credentials or balances from your bank.
- SMS messages.
- Contacts, photos, location, calendar.
- Voice audio. Speech recognition runs entirely on your device using
  Android's built-in speech recognizer with the offline language pack.

## 3. Where data is processed

Locally on your device, always. The only exceptions are the two
opt-in services named above, processed in their respective regions.

## 4. How long we keep it

As long as you keep the app installed. Use **Settings → Delete all my
data** to wipe everything immediately and irreversibly. Opt-in
analytics and crash reports follow the providers' retention (PostHog:
90 days; Sentry: 90 days). Disabling the opt-in stops future
collection but does not delete past records — contact us via the
support email below to request deletion.

## 5. Your rights under DPDP Act 2023

- **Access** — All your data is on your device. Export it as a CSV
  (Reports → Export) or an encrypted JSON backup (Settings → Backup).
- **Correction** — Edit any transaction, account, category, budget, or
  recurring entry directly in the app.
- **Erasure** — Settings → Delete all my data wipes everything.
  Uninstalling the app deletes the database too.
- **Portability** — CSV export is universal. Encrypted backup uses a
  documented format (see `prompts/05_DATA_MODEL.md` in the source).

## 6. Backups

When you export a backup, it is encrypted on your device with AES-256-GCM
using a key derived from your passphrase via PBKDF2-SHA256 (250,000
iterations). The file lives wherever you save it through Android's
Storage Access Framework. We never see it.

If you lose the passphrase, the backup cannot be recovered.

## 7. Children

moneyNest is not directed at users under 18. Please do not use it if
you are under 18.

## 8. Changes to this policy

Material changes will be announced in-app and on this page. Continued
use after a change indicates acceptance.

## 9. Contact

Mahendra Singh Puniya
[mahendrapuniya92@gmail.com](mailto:mahendrapuniya92@gmail.com)
