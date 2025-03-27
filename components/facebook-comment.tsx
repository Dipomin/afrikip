import React, { useEffect } from "react";

const FacebookComment = ({ url, appId }) => {
  useEffect(() => {
    console.log("Loading Facebook script");
    const facebookScript = document.createElement("script");
    facebookScript.async = true;
    facebookScript.src = `https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v7.0&appId=${appId}&autoLogAppEvents=1`;
    facebookScript.onload = () => {
      if (window.FB) {
        window.FB.XFBML.parse();
      }
    };
    document.body.appendChild(facebookScript);
  }, [url, appId]);

  return (
    <React.Fragment>
      <div id="fb-root"></div>
      <div
        className="fb-comments"
        data-href={url}
        data-numposts="10"
        data-width="100%"
      ></div>
    </React.Fragment>
  );
};

export default FacebookComment;
