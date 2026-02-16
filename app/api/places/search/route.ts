import { NextResponse } from 'next/server';
import { searchPlacesByKeyword } from '@/lib/kakao';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q');
  const page = Number(searchParams.get('page')) || 1;
  const size = Number(searchParams.get('size')) || 15;

  if (!keyword) {
    return NextResponse.json(
      { error: 'Missing query parameter: q' },
      { status: 400 }
    );
  }

  try {
    const data = await searchPlacesByKeyword(keyword, page, size);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Kakao API error:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
