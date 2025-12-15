import { Handler } from '@netlify/functions';
import participantsData from './data/participants.json';

interface Participant {
  id: string;
  isim: string;
  soyisim: string;
  code: string;
}

const participants = participantsData as Participant[];

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { code } = JSON.parse(event.body || '{}');

    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ message: "TC Kimlik No son 5 hanesi gereklidir." }) };
    }

    const userInput = code.toString().trim();

    // Verify exactly 5 digits just for sanity check, though not strictly required by logic
    if (userInput.length !== 5) {
      return { statusCode: 400, body: JSON.stringify({ message: "Lütfen 5 haneli kodu eksiksiz girin." }) };
    }

    // Find user solely by code
    const user = participants.find(p => p.code === userInput);

    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: user.id,
          isim: user.isim,
          soyisim: user.soyisim
        }),
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Bu numaraya ait kayıt bulunamadı." }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Sunucu hatası" }) };
  }
};
