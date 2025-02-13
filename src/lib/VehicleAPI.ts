import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { Vehicle } from '@/types/Vehicle';
import { useMutation, useQuery } from '@tanstack/react-query';

export const getVehicles = async (
    page: number = 1,
    pageSize: number = 10,
    filter = '',
    sortColumn = '',
    sortDesc = false
): Promise<{ data: Vehicle[]; last_page: number }> => {
    const response = await api.get<{ data: { data: Vehicle[]; current_page: number; last_page: number; total: number } }>(`/api/vehicles`, {
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

export const showVehicle = async (id: number): Promise<Response> => {
    const response = await api.get(`/api/vehicle/${id}`);
    return response.data;
};

export const createVehicle = async (inputs: Vehicle): Promise<Response> => {
    const response = await api.post<Response>(`/api/vehicle`, inputs);
    return response.data;
};

export const updateVehicle = async (id: number, inputs: Vehicle): Promise<Response> => {
    const response = await api.put<Response>(`/api/vehicle/${id}`, inputs);
    return response.data;
};

export const deleteVehicle = async (id: number): Promise<Response> => {
    const response = await api.delete(`/api/vehicle/${id}`);
    return response.data;
};

export const useVehicles = (
    page: number = 1,
    pageSize: number = 10,
    globalFilter = '',
    sortColumn = '',
    sortDesc = false
) =>
    useQuery({
        queryKey: ['vehicles', page, pageSize, globalFilter, sortColumn, sortDesc],
        queryFn: async (): Promise<{ data: Vehicle[]; last_page: number }> => {
            return await getVehicles(page, pageSize, globalFilter, sortColumn, sortDesc);
        },
    });

export const useShowVehicle = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await showVehicle(id);
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

export const useCreateVehicle = () => {
    return useMutation({
        mutationFn: async (inputs: Vehicle) => {
            return await createVehicle(inputs);
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

export const useUpdateVehicle = () => {
    return useMutation({
        mutationFn: async ({ id, vehicleData }: { id: number; vehicleData: Vehicle }) => {
            return await updateVehicle(id, vehicleData);
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

export const useDeleteVehicle = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteVehicle(id);
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
