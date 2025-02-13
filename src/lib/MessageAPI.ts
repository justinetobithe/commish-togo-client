import { MessageInputs } from '@/components/AppInbox';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types/Message';

export const getMessages = async (recipient_id: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/api/messages`, {
        params: {
            recipient_id,
        },
    });
    return data;
};

export const sendMessage = async (
    recipient_id: string,
    params: MessageInputs
): Promise<Response> => {
    const { data } = await api.post<Response>(`/api/messages/send-message`, {
        recipient_id,
        content: params.content,
    });
    return data;
};

/* HOOKS */
export const useGetMessages = (recipient_id: string) =>
    useQuery({
        queryKey: ['messages', recipient_id],
        queryFn: async (): Promise<Message[]> => {
            return await getMessages(recipient_id);
        },
    });

export const useSendMessage = () => {
    return useMutation({
        mutationFn: async ({
            recipient_id,
            data,
        }: {
            recipient_id: string;
            data: MessageInputs;
        }) => {
            return await sendMessage(recipient_id, data);
        },
        onSuccess: async () => { },
    });
};
/* END HOOKS */
