import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, user, repo, filePath, content, message } = await request.json();

  if (!token || !user || !repo || !filePath || !content || !message) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  const url = `https://api.github.com/repos/${user}/${repo}/contents/${filePath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      message: message,
      committer: {
        name: user,
        email: `${user}@gmail.com`
      },
      content: Buffer.from(content).toString('base64')
    })
  });

  const data = await response.json();

  if (response.status === 201) {
    return NextResponse.json({ success: true, message: 'File created successfully', data });
  } else {
    return NextResponse.json({ success: false, error: data.message || 'Something went wrong' });
  }
}
