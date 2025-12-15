import { Handler } from '@netlify/functions';
import matches from './data/matches.json';

export const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { id } = event.queryStringParameters || {};

        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ message: "ID gerekli" }) };
        }

        // In a real app, verify token/session here. 
        // For this simple version, we assume ID is known only by the logged-in user context.

        const match = matches.find(m => m.giverId === id);

        if (match) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    receiverName: match.receiverName
                }),
            };
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Eşleşme bulunamadı." }),
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Sunucu hatası" }) };
    }
};
