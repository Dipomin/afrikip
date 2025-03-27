import { useEffect } from "react";

export default function TextToSpeech({ post }) {
  useEffect(() => {
    const url = "https://play.ht/api/v2/tts/stream";
    const text = post;

    const headers = new Headers();
    headers.append("accept", "audio/mpeg");
    headers.append("content-type", "application/json");
    headers.append("AUTHORIZATION", `Bearer ${process.env.PLAY_HT_SECRET_KEY}`);
    headers.append("X-USER-ID", process.env.PLAY_HT_USER_ID || ""); // Assurez-vous qu'il y ait toujours une valeur, même si elle est vide

    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        text: post,
        voice: "nathan",
        quality: "draft",
        output_format: "mp3",
      }),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.error("error:" + err));
  }, []);

  return <div></div>;
}
