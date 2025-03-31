import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { WorkExperience } from '@/types/WorkExperience';
import { useMutation, useQuery } from '@tanstack/react-query';

export const fetchWorkExperiences = async (userId: number): Promise<Response> => {
    const response = await api.get<Response>(`/api/work-experience`, {
        params: { user_id: userId }
    });
    return response.data;
};

export const createWorkExperience = async (inputs: WorkExperience): Promise<Response> => {
    const response = await api.post<Response>(`/api/work-experience`, inputs, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

export const updateWorkExperience = async (
    id: number,
    inputs: WorkExperience
): Promise<Response> => {
    const response = await api.put<Response>(`/api/work-experience/${id}`, inputs, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

export const deleteWorkExperience = async (id: number): Promise<Response> => {
    const response = await api.delete<Response>(`/api/work-experience/${id}`);
    return response.data;
};

export const useGetWorkExperiences = (userId: number) => {
    return useQuery({
        queryKey: ['work-experiences', userId],
        queryFn: () => fetchWorkExperiences(userId),
    });
};

export const useCreateWorkExperience = () => {
    return useMutation({
        mutationFn: async (inputs: WorkExperience) => {
            return await createWorkExperience(inputs);
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
                description: 'Failed to create work experience.',
            });
        },
    });
};

export const useUpdateWorkExperience = () => {
    return useMutation({
        mutationFn: async ({ id, workData }: { id: number; workData: WorkExperience }) => {
            return await updateWorkExperience(id, workData);
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
                description: 'Failed to update work experience.',
            });
        },
    });
};

export const useDeleteWorkExperience = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteWorkExperience(id);
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
                description: 'Failed to delete work experience.',
            });
        },
    });
};
