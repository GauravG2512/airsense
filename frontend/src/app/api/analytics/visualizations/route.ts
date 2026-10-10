import { NextResponse } from 'next/server';
import analyticsData from '@/lib/analytics_cache.json';

export async function GET() {
  return NextResponse.json(analyticsData);
}
