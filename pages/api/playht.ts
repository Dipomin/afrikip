import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text, voice, quality, output_format } = req.body;

  if (!process.env.PLAY_HT_SECRET_KEY || !process.env.PLAY_HT_USER_ID) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const response = await fetch("https://play.ht/api/v2/tts/stream", {
      method: "POST",
      headers: {
        "accept": "audio/mpeg",
        "content-type": "application/json",
        "AUTHORIZATION": `Bearer ${process.env.PLAY_HT_SECRET_KEY}`,
        "X-USER-ID": process.env.PLAY_HT_USER_ID,
      },
      body: JSON.stringify({
        text,
        voice: voice || "nathan",
        quality: quality || "draft",
        output_format: output_format || "mp3",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    // Forward the audio stream
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);

  } catch (error) {
    console.error('PlayHT API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
