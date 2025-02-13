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
import { useCreateVehicle, useUpdateVehicle } from '@/lib/VehicleAPI';
import AppSpinner from './AppSpinner';
import { QueryClient } from '@tanstack/react-query';
import { Vehicle } from '@/types/Vehicle';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import { api } from '@/lib/api';
import User from '@/types/User'
import { Driver } from '@/types/Driver';

const vehicleSchema = z.object({
    id: z.number().optional(),
    driver_id: z.number().min(1, { message: 'Driver is required' }),
    license_plate: z.string().min(1, { message: 'License plate is required' }),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.string().min(1, { message: 'Year is required' }),
    capacity: z.string().min(1, { message: 'Capacity must be at least 1' }).optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

interface AppVehicleFormProps {
    data?: Vehicle;
    isOpen: boolean;
    onClose: () => void;
    queryClient: QueryClient;
}

const AppVehicleForm: FC<AppVehicleFormProps> = ({ data, isOpen, onClose, queryClient }) => {
    const [loading, setLoading] = useState(false);

    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await api.get<{ data: Driver[] }>('/api/drivers');
                setDrivers(response.data.data);
            } catch (error) {
                console.error("Error fetching drivers:", error);
            }
        };
        fetchDrivers();
    }, []);

    const form = useForm<VehicleInput>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            id: data?.id,
            driver_id: data?.driver_id || undefined,
            license_plate: data?.license_plate || '',
            brand: data?.brand || '',
            model: data?.model || '',
            year: data?.year || '',
            capacity: data?.capacity || '',
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                driver_id: data.driver_id,
                license_plate: data.license_plate,
                brand: data.brand,
                model: data.model,
                year: data.year,
                capacity: data.capacity,
            });
        }
    }, [data, form]);

    const { mutate: createVehicle, isPending: isCreating } = useCreateVehicle();
    const { mutate: updateVehicle, isPending: isUpdating } = useUpdateVehicle();

    const onSubmit = async (formData: VehicleInput) => {
        setLoading(true);

        if (data && data.id) {
            await updateVehicle(
                { id: data.id, vehicleData: formData },
                {
                    onSettled: () => {
                        onClose();
                        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
                    },
                }
            );
        } else {
            await createVehicle(formData, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
                },
            });
        }
        setLoading(false);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{data ? 'Edit Vehicle' : 'Add Vehicle'}</AlertDialogTitle>
                </AlertDialogHeader>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <FormField
                                control={form.control}
                                name="driver_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Driver</FormLabel>
                                        <Controller
                                            control={form.control}
                                            name="driver_id"
                                            render={({ field }) => (
                                                <Select
                                                    value={drivers.find(driver => driver.id === field.value) ? {
                                                        value: field.value!,
                                                        label: `${drivers.find(driver => driver.id === field.value)?.first_name} - ${drivers.find(driver => driver.id === field.value)?.last_name}`,
                                                    } : null}
                                                    options={drivers.map(driver => ({
                                                        value: driver.id!,
                                                        label: `${driver.first_name} - ${driver.last_name}`,
                                                    }))}
                                                    onChange={option => field.onChange(option?.value!)}
                                                    isClearable
                                                />
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='license_plate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>License Plate</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='brand'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='model'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='year'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <FormControl>
                                            <Input type='number' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='capacity'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input type='number' {...field} />
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

export default AppVehicleForm;
