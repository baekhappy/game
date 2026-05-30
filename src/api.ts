export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('audio', blob, `recording.${ext}`);

  const res = await fetch('/api/chat', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '알 수 없는 오류' }));
    throw new Error(err.error ?? '음성 인식 실패');
  }

  const data = await res.json();
  return (data.text as string) ?? '';
}

export function checkAnswer(transcript: string, expected: string): boolean {
  const norm = (s: string) => s.replace(/\s/g, '').toLowerCase();
  return norm(transcript).includes(norm(expected));
}
