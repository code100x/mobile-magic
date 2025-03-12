import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: any) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    console.log(code)
    if (!code) {
      return NextResponse.json({ message: 'Missing code' }, { status: 400 });
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: "Ov23ligJEGHq8tCMte5X",
        client_secret: "6e7c841b0630251a386ad3b935ddf6d71157f999",
        code,
      }),
    });

    const data = await response.json();
    if (!data.access_token) {
      return NextResponse.json({ message: 'Failed to get access token' }, { status: 500 });
    }

    console.log({ access_token: data.access_token })

    return NextResponse.json({ access_token: data.access_token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
