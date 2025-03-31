import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Resume } from '@/types/Resume';
import { useMutation, useQuery } from '@tanstack/react-query';

export const showResume = async (id: number): Promise<Response> => {
    const response = await api.get(`/api/resume/${id}`);
    return response.data;
};

export const createResume = async (inputs: Resume): Promise<Response> => {
    const response = await api.post<Response>(`/api/resume`, inputs, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateResume = async (id: number, inputs: Resume): Promise<Response> => {
    const response = await api.post<Response>(`/api/resume/${id}`, inputs, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};


export const deleteResume = async (id: number): Promise<Response> => {
    const response = await api.delete(`/api/resume/${id}`);
    return response.data;
};

export const getUserResume = async (
    userId?: number,
): Promise<{ data: Resume[] }> => {
    const response = await api.get<{ data: Resume[] }>('/api/resume/user', {
        params: {
            ...(userId && { user_id: userId }),
        },
    });

    return response.data;
};



export const useShowResume = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await showResume(id);
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

export const useCreateResume = () => {
    return useMutation({
        mutationFn: async (inputs: Resume) => {
            return await createResume(inputs);
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

export const useUpdateResume = () => {
    return useMutation({
        mutationFn: async ({ id, resumeData }: { id: number; resumeData: Resume }) => {
            return await updateResume(id, resumeData);
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

export const useDeleteResume = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteResume(id);
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

export const useGetUserResume = (userId?: number) => {
    return useQuery({
        queryKey: ['resumes', userId],
        queryFn: async () => await getUserResume(userId),
    });
};
