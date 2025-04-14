import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types/Message';

export const getMessages = async (recipient_id: string | null): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/api/messages`, {
        params: {
            recipient_id,
        },
    });
    return data;
};

export const sendMessage = async (
    recipient_id: string,
    message: string
): Promise<Response> => {
    const { data } = await api.post<Response>(`/api/messages/send-message`, {
        recipient_id,
        content: message,
    });
    return data;
};

/* HOOKS */
export const useGetMessages = (recipient_id: string | null) =>
    useQuery({
        queryKey: ['messages', recipient_id],
        queryFn: async (): Promise<Message[]> => {
            return await getMessages(recipient_id);
        },
        enabled: !!recipient_id
    });

export const useSendMessage = () => {
    return useMutation({
        mutationFn: async ({
            recipient_id,
            message,
        }: {
            recipient_id: string;
            message: string;
        }) => {
            return await sendMessage(recipient_id, message);
        },
        onSuccess: async () => { },
    });
};
/* END HOOKS */
