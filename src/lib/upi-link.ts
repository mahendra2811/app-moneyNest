/**
 * UPI payment request deep link — D5.
 *
 * Generates the standard UPI URI per NPCI spec:
 *   upi://pay?pa=<payeeUpi>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 *
 * Any UPI app (GPay/PhonePe/Paytm/BHIM) handles it.
 */
export type UpiRequest = {
  payeeUpiId: string;
  payeeName: string;
  amountRupees?: number;
  note?: string;
};

export function buildUpiUri(req: UpiRequest): string {
  const params: string[] = [
    `pa=${encodeURIComponent(req.payeeUpiId)}`,
    `pn=${encodeURIComponent(req.payeeName)}`,
    'cu=INR',
  ];
  if (req.amountRupees !== undefined && req.amountRupees > 0) {
    params.push(`am=${req.amountRupees.toFixed(2)}`);
  }
  if (req.note) params.push(`tn=${encodeURIComponent(req.note)}`);
  return `upi://pay?${params.join('&')}`;
}
