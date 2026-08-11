import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.GOOGLE_TRANSLATE_API_KEY;
  return NextResponse.json({ hasKey });
}
