import type { ChatMessage } from '../types';

export const getAssistantResponse = async (
    history: ChatMessage[]
): Promise<{ text: string }> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ history }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("API request failed:", response.status, response.statusText, errorData);
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return { text: data.text };

    } catch (error) {
        console.error("Error calling backend API:", error);
        return { text: "Desculpe, ocorreu um erro ao comunicar com o nosso sistema. Por favor, tente novamente mais tarde." };
    }
};
