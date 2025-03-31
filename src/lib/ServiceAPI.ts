import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Service } from '@/types/Service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const getServices = async (
    page: number = 1,
    pageSize: number = 10,
    filter = '',
    sortColumn = '',
    sortDesc = false
): Promise<{ data: Service[]; last_page: number }> => {
    const response = await api.get<{ data: { data: Service[]; current_page: number; last_page: number; total: number } }>(`/api/services`, {
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

export const createService = async (inputs: Service): Promise<Response> => {
    const response = await api.post<Response>(`/api/service`, inputs);
    return response.data;
};

export const updateService = async (id: number, inputs: Service): Promise<Response> => {
    const response = await api.put<Response>(`/api/service/${id}`, inputs);
    return response.data;
};

export const deleteService = async (id: number): Promise<Response> => {
    const response = await api.delete(`/api/service/${id}`);
    return response.data;
};

export const useServices = (
    page: number = 1,
    pageSize: number = 10,
    globalFilter = '',
    sortColumn = '',
    sortDesc = false
) =>
    useQuery({
        queryKey: ['services', page, pageSize, globalFilter, sortColumn, sortDesc],
        queryFn: async (): Promise<{ data: Service[]; last_page: number }> => {
            return await getServices(page, pageSize, globalFilter, sortColumn, sortDesc);
        },
    });

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (inputs: Service) => {
            return await createService(inputs);
        },
        onSuccess: (response) => {
            if (response && response.status === "success") {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
    });
};

export const useUpdateService = () => {
    return useMutation({
        mutationFn: async ({ id, serviceData }: { id: number; serviceData: Service }) => {
            return await updateService(id, serviceData);
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

export const useDeleteService = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteService(id);
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
