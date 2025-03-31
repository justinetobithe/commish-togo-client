import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import Response from '@/types/Response';
import { JobApplication } from '@/types/JobApplication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const getJobApplications = async (
    page: number = 1,
    pageSize: number = 10,
    filter = '',
    sortColumn = '',
    sortDesc = false
): Promise<{ data: JobApplication[]; last_page: number }> => {
    const response = await api.get<{ data: { data: JobApplication[]; current_page: number; last_page: number; total: number } }>(`/api/job-applications`, {
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

export const createJobApplication = async (inputs: JobApplication): Promise<Response> => {
    const response = await api.post<Response>(`/api/job-application`, inputs);
    return response.data;
};

export const updateJobApplication = async (id: number, inputs: JobApplication): Promise<Response> => {
    const response = await api.put<Response>(`/api/job-application/${id}`, inputs);
    return response.data;
};

export const deleteJobApplication = async (id: number): Promise<Response> => {
    const response = await api.delete(`/api/job-application/${id}`);
    return response.data;
};

export const useJobApplications = (
    page: number = 1,
    pageSize: number = 10,
    globalFilter = '',
    sortColumn = '',
    sortDesc = false
) =>
    useQuery({
        queryKey: ['job_applications', page, pageSize, globalFilter, sortColumn, sortDesc],
        queryFn: async (): Promise<{ data: JobApplication[]; last_page: number }> => {
            return await getJobApplications(page, pageSize, globalFilter, sortColumn, sortDesc);
        },
    });

export const useCreateJobApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (inputs: JobApplication) => {
            return await createJobApplication(inputs);
        },
        onSuccess: (response) => {
            if (response && response.status === "success") {
                queryClient.invalidateQueries({ queryKey: ['job_applications'] });
                toast({
                    variant: 'success',
                    description: response.message,
                });
            }
        },
    });
};

export const useUpdateJobApplication = () => {
    return useMutation({
        mutationFn: async ({ id, jobApplicationData }: { id: number; jobApplicationData: JobApplication }) => {
            return await updateJobApplication(id, jobApplicationData);
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

export const useDeleteJobApplication = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteJobApplication(id);
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
