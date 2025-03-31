import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Post } from '@/types/Post';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export const getPosts = async (
    page: number = 1,
    pageSize: number = 10,
    filter = '',
    sortColumn = '',
    sortDesc = false,
): Promise<{ data: Post[]; last_page: number }> => {
    const response = await api.get<{ data: { data: Post[]; current_page: number; last_page: number; total: number } }>(`/api/posts`, {
        params: {
            page,
            ...(pageSize && { page_size: pageSize }),
            ...(filter && { filter }),
            ...(sortColumn && { sort_column: sortColumn }),
            sort_desc: sortDesc,
        },
    });

    const { data } = response.data;

    return {
        data: data.data,
        last_page: data?.last_page,
    };
};

export const showPost = async (id: number): Promise<Response> => {
    const response = await api.get(`/api/post/${id}`);
    return response.data;
};

export const createPost = async (inputs: Post): Promise<Response> => {
    const formData = new FormData();
    Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (inputs.service_id && inputs.service_id.length > 0) {
        inputs.service_id.forEach(id => formData.append("service_id[]", id.toString()));
    }

    if (inputs.application_deadline) {
        formData.append('application_deadline', format(new Date(inputs.application_deadline), 'yyyy-MM-dd'));
    }

    const response = await api.post<Response>(`/api/post`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updatePost = async (id: number, inputs: Post): Promise<Response> => {
    const formData = new FormData();
    Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value);
    });

    if (inputs.service_id && inputs.service_id.length > 0) {
        inputs.service_id.forEach(id => formData.append("service_id[]", id.toString()));
    }

    if (inputs.application_deadline) {
        formData.append('application_deadline', format(new Date(inputs.application_deadline), 'yyyy-MM-dd'));
    }

    formData.append('_method', 'PUT');

    const response = await api.post<Response>(`/api/post/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};


export const deletePost = async (id: number): Promise<Response> => {
    const response = await api.delete(`/api/post/${id}`);
    return response.data;
};


export const getUserPosts = async (
    userId?: number,
    search?: string,
): Promise<{ data: Post[] }> => {
    const response = await api.get<{ data: Post[] }>('/api/user-posts', {
        params: {
            ...(userId && { user_id: userId }),
            ...(search && { search }),
        },
    });

    return response.data;
};

export const usePosts = (
    page: number,
    pageSize: number,
    searchKeyword?: string,
    sortBy?: string,
    sortDesc?: boolean,
) => {
    return useQuery({
        queryKey: ['posts', page, pageSize, searchKeyword, sortBy, sortDesc,],
        queryFn: async () => {
            const response = await api.get('/api/posts', {
                params: {
                    page,
                    per_page: pageSize,
                    search: searchKeyword,
                    sort_by: sortBy,
                    sort_desc: sortDesc,
                },
            });

            return response.data;
        },
    });
};

export const useShowPost = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await showPost(id);
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

export const useCreatePost = () => {
    return useMutation({
        mutationFn: async (inputs: Post) => {
            return await createPost(inputs);
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

export const useUpdatePost = () => {
    return useMutation({
        mutationFn: async ({ id, postData }: { id: number; postData: Post }) => {
            return await updatePost(id, postData);
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

export const useDeletePost = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deletePost(id);
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

export const useUserPosts = (userId?: number, search?: string) => {
    return useQuery({
        queryKey: ['posts', userId, search],
        queryFn: async () => await getUserPosts(userId, search),
    });
};
