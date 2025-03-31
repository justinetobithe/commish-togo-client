import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Profile } from '@/types/Profile';
import { useMutation, useQuery } from '@tanstack/react-query';

export const getAllProfiles = async (): Promise<Response> => {
    const response = await api.get(`/api/profiles`);
    return response.data;
};

export const showProfile = async (userId: number): Promise<Response> => {
    const response = await api.get(`/api/profile/user/${userId}`);
    return response.data.data;
};

export const createProfile = async (inputs: Profile): Promise<Response> => {
    const response = await api.post<Response>(`/api/profile`, inputs, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const updateProfile = async (id: number, inputs: Profile): Promise<Response> => {
    const response = await api.put<Response>(`/api/profile/${id}`, inputs, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.data;
};

export const useShowProfile = () => {
    return useMutation({
        mutationFn: async (userId: number) => {
            return await showProfile(userId);
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

export const useCreateProfile = () => {
    return useMutation({
        mutationFn: async (inputs: Profile) => {
            return await createProfile(inputs);
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

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: async ({ id, profileData }: { id: number; profileData: Profile }) => {
            return await updateProfile(id, profileData);
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

export const useGetUserProfile = (userId: number) => {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => await showProfile(userId),
    });
};

export const useGetAllProfiles = () => {
    return useQuery({
        queryKey: ['profiles'],
        queryFn: async () => await getAllProfiles(),
    });
};

