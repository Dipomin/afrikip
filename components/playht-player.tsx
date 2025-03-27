import React, { useEffect } from "react";

function PlayerHT({ appId, userId }) {
  useEffect(() => {
    if (!document.getElementById("playht-plugin-styles")) {
      const head = document.getElementsByTagName("head")[0];
      const link = document.createElement("link");
      link.id = "playht-plugin-styles";
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://static.play.ht/playht-pageplayer-plugin.css";
      link.media = "print";
      link.onload = function (this: HTMLLinkElement) {
        this.media = "all";
      };
      head.appendChild(link);
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://static.play.ht/playht-pageplayer-plugin.js";
    script.async = true;
    (script as HTMLScriptElement).onload = function (this: HTMLScriptElement) {
      (window as any).playht.playerSettings({
        appId: appId,
        userId: userId,
        playerType: "ep_iframe",
        enableBuffering: false,
        listenBtnElement: "#playht-audioplayer-element",
      });
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  }, [appId, userId]);

  return (
    <div>
      <div id="playht-audioplayer-element"></div>
    </div>
  );
}

export default PlayerHT;
