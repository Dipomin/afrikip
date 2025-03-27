import React, { useEffect, useState } from "react";

function PlayAudio({ post }) {
  const [articleAudio, setArticleAudio] = useState<string | undefined | null>(
    null
  );

  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const text = post;
    const voice = "nathan";

    const authorizationToken = `${process.env.PLAY_HT_SECRET_KEY}, ${process.env.PLAY_HT_USER_ID}`;

    fetch("/api/playht", {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice }),
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          const audioUrl = data.href;
          setAudioUrl(audioUrl);
          console.log("Reponse audio reçue");
        } else {
          console.log("Reponse audio non valide");
        }
      })
      .catch((error) => {
        console.log("Quelque chose s'est mal passée", error);
      });
  }, []);

  console.log(articleAudio);

  return (
    <div>
      {audioUrl && (
        <audio controls autoPlay>
          <source src={audioUrl} />
        </audio>
      )}
    </div>
  );
}

export default PlayAudio;
