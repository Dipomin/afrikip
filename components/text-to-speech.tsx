import { useEffect } from "react";

export default function TextToSpeech({ post }) {
  useEffect(() => {
    fetch("/api/playht", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: post,
        voice: "nathan",
        quality: "draft",
        output_format: "mp3",
      }),
    })
      .then(async (res) => {
        if (res.ok) {
           const blob = await res.blob();
           const audioUrl = URL.createObjectURL(blob);
           const audio = new Audio(audioUrl);
           audio.play();
        }
      })
      .catch((err) => console.error("error:" + err));
  }, [post]);

  return <div></div>;
}
