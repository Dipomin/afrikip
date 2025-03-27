
import axios from 'axios';

const playhtAPI = axios.create({
  baseURL: 'https://play.ht/api/v2/tts/stream', 
  headers: {
    'Authorization': process.env.PLAY_HT_SECRET_KEY, 
    'X-USER-ID' : process.env.PLAY_HT_USER_ID,
    'Content-Type': 'application/json',
  },
});

export const convertTextToSpeech = async (text, voice) => {
  try {
    const response = await playhtAPI.post('https://play.ht/api/v2/tts/stream', {
      text,
      voice,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la conversion en voix :', error);
    throw error;
  }
};
