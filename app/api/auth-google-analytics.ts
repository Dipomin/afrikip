// pages/api/auth-google-analytics.js
import { google } from "googleapis";

export default async function handler(req, res) {
  // Configuration de l'OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ANALYTICS_CLIENT_ID,
    process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
    process.env.GOOGLE_ANALYTICS_REDIRECT_URIS
  );

  // Génération de l'URL d'autorisation
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
  });

  // Redirection vers l'URL d'autorisation
  res.redirect(authorizeUrl);
}
