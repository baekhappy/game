import type { VercelRequest, VercelResponse } from '@vercel/node'
import formidable, { type File } from 'formidable'
import { createReadStream } from 'fs'
import OpenAI, { toFile } from 'openai'

// Vercel: disable default body parser to receive raw multipart stream
export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' })
  }

  try {
    // Parse multipart/form-data
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 })
    const [, files] = await form.parse(req)

    const audioFiles = files.audio
    if (!audioFiles || audioFiles.length === 0) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const audio = audioFiles[0] as File
    const openai = new OpenAI({ apiKey })

    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(
        createReadStream(audio.filepath),
        audio.originalFilename ?? 'recording.webm',
        { type: audio.mimetype ?? 'audio/webm' },
      ),
      model: 'whisper-1',
      language: 'ko',
    })

    return res.status(200).json({ text: transcription.text })
  } catch (err) {
    console.error('[api/chat] error:', err)
    return res.status(500).json({ error: '음성 인식 중 오류가 발생했습니다.' })
  }
}
