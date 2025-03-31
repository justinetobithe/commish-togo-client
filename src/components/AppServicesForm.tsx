import React, { FC, useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useCreateService, useUpdateService } from '@/lib/ServiceAPI';
import AppSpinner from './AppSpinner';
import { QueryClient } from '@tanstack/react-query';
import { Service } from '@/types/Service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from './ui/textarea';

const serviceSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, { message: 'Name is required' }),
    description: z.string().min(3, { message: 'Description is required' }),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

interface AppServicesFormProps {
    data?: Service;
    isOpen: boolean;
    onClose: () => void;
    queryClient: QueryClient;
}

const AppServicesForm: FC<AppServicesFormProps> = ({ data, isOpen, onClose, queryClient }) => {
    const [loading, setLoading] = useState(false);

    const form = useForm<ServiceInput>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            id: data?.id,
            name: data?.name || '',
            description: data?.description || '',
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                name: data.name,
                description: data.description,
            });
        }
    }, [data, form]);

    const { mutate: createService, isPending: isCreating } = useCreateService();
    const { mutate: updateService, isPending: isUpdating } = useUpdateService();

    const onSubmit = async (formData: ServiceInput) => {
        setLoading(true);

        if (data && data.id) {
            await updateService(
                { id: data.id, serviceData: formData },
                {
                    onSettled: () => {
                        onClose();
                        queryClient.invalidateQueries({ queryKey: ['services'] });
                    },
                }
            );
        } else {
            await createService(formData, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['services'] });
                },
            });
        }
        setLoading(false);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{data ? 'Edit Service' : 'Add Service'}</AlertDialogTitle>
                </AlertDialogHeader>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='mt-5 flex space-x-2'>
                                <Button variant="outline" onClick={onClose}>Close</Button>
                                <Button type="submit" variant="default" className="text-white" disabled={isCreating || isUpdating}>
                                    {loading ? <AppSpinner /> : (data ? 'Save' : 'Add')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AppServicesForm;
