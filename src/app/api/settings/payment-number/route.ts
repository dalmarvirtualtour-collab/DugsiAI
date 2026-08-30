import { NextResponse } from 'next/server';

export async function GET() {
  const number = process.env.PAYMENT_PHONE_NUMBER || '+251930379676';
  return NextResponse.json({ paymentPhoneNumber: number });
}
