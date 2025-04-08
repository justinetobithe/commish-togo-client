import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Conversation } from '@/types/Conversation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const createConversation = async (inputs: Conversation): Promise<Response> => {
    const response = await api.post<Response>('/api/conversation', inputs);
    return response.data;
};

export const getConversations = async (): Promise<Response> => {
    const response = await api.get('/api/conversations');
    return response.data;
};
export const showConversation = async (id: number): Promise<Response> => {
    const response = await api.get(`/api/conversation/${id}`);
    return response.data;
};

export const useCreateConversation = () => {
    return useMutation({
        mutationFn: async (inputs: Conversation) => {
            return await createConversation(inputs);
        },
        onSuccess: (response) => {
            if (response && response.status === 'success') {
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                description: `Error: ${error?.message}`,
            });
        },
    });
};

export const useGetConversations = () => {
    return useQuery({
        queryKey: ['conversations',],
        queryFn: async () => {
            const response = await api.get('/api/conversations');
            return response.data;
        },
    });
};

export const useConversation = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await showConversation(id);
        },
        onSuccess: (response) => {
            if (response && response.status === "success") {
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
    });
};