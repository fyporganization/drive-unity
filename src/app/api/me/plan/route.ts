import { NextResponse } from 'next/server';
import { getUserPlan } from '@/lib/auth/plan';

export async function GET() {
  const plan = await getUserPlan();
  if (!plan) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(plan);
}
