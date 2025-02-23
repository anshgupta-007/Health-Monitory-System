import { NextResponse } from 'next/server';
import mailSender from '@/utils/mailsender'; // This file should be server-only (e.g. mailsender.ts, not .tsx)

export async function POST(request: Request) {
  try {
    const { email, title, body } = await request.json();

    await mailSender({ email, title, body });
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
