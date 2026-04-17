import { NextRequest, NextResponse } from 'next/server';

interface VArchiveResponse {
  djClass: string;
  djPowerConversion: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const mode = searchParams.get('mode');

  if (!user || !mode) {
    return NextResponse.json(
      { error: 'Missing required parameters: user and mode' },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://v-archive.net/api/v2/archive/${encodeURIComponent(user)}/djClass/${mode}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `V-Archive API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as VArchiveResponse;
    
    // Validate the response format
    if (!data || !data.djClass || typeof data.djPowerConversion !== 'number') {
      return NextResponse.json(
        { error: 'Invalid data format from V-Archive API' },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from V-Archive API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from V-Archive' },
      { status: 500 }
    );
  }
}
