import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { EducationalAttainment } from '@/types/EducationalAttainment';
import { useMutation, useQuery } from '@tanstack/react-query';

export const fetchEducationalAttainments = async (userId: number): Promise<Response> => {
    const response = await api.get<Response>(`/api/educational-attainment`, {
        params: { user_id: userId }
    });
    return response.data;
};

export const createEducatinalAttainment = async (inputs: EducationalAttainment): Promise<Response> => {
    const response = await api.post<Response>(`/api/educational-attainment`, inputs, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

export const updateEducatinalAttainment = async (
    id: number,
    inputs: EducationalAttainment
): Promise<Response> => {
    const response = await api.put<Response>(`/api/educational-attainment/${id}`, inputs, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

export const deleteEducatinalAttainment = async (id: number): Promise<Response> => {
    const response = await api.delete<Response>(`/api/educational-attainment/${id}`);
    return response.data;
};

export const useGetEducationalAttainments = (userId: number) => {
    return useQuery({
        queryKey: ['educational-attainments', userId],
        queryFn: () => fetchEducationalAttainments(userId),
    });
};

export const useCreateEducatinalAttainment = () => {
    return useMutation({
        mutationFn: async (inputs: EducationalAttainment) => {
            return await createEducatinalAttainment(inputs);
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
        onError: () => {
            toast({
                variant: 'destructive',
                description: 'Failed to create educational attainment.',
            });
        },
    });
};

export const useUpdateEducatinalAttainment = () => {
    return useMutation({
        mutationFn: async ({ id, educationalAttainmentData }: { id: number; educationalAttainmentData: EducationalAttainment }) => {
            return await updateEducatinalAttainment(id, educationalAttainmentData);
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
        onError: () => {
            toast({
                variant: 'destructive',
                description: 'Failed to update educational attainment.',
            });
        },
    });
};

export const useDeleteEducatinalAttainment = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteEducatinalAttainment(id);
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
        onError: () => {
            toast({
                variant: 'destructive',
                description: 'Failed to delete educational attainment.',
            });
        },
    });
};
