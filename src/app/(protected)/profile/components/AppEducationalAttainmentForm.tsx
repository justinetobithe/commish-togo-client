'use client';
import React, { FC, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppSpinner from '@/components/AppSpinner';
import User from '@/types/User';
import { Trash2, Loader2, } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useCreateEducatinalAttainment, useDeleteEducatinalAttainment, useGetEducationalAttainments } from '@/lib/EducationalAttainmentAPI';
import { EducationalAttainment } from '@/types/EducationalAttainment';

export const inputSchema = z
    .object({
        institution_name: z.string().min(1, 'Institution name is required'),
        degree: z.string().min(1, 'Degree is required'),
        field_of_study: z.string().optional(),
        start_date: z.string().min(1, 'Start date is required'),
        end_date: z.string().optional(),
        description: z.string().optional(),
        is_current: z.boolean().optional(),
    })
    .refine((data) => {
        if (data.end_date && data.start_date) {
            return new Date(data.end_date) >= new Date(data.start_date);
        }
        return true;
    }, {
        message: "End date must be after or equal to start date",
        path: ['end_date'],
    });

const formatDate = (date: string) => date ? format(new Date(date), "MMMM dd, yyyy") : 'N/A';

export type ResumeInput = z.infer<typeof inputSchema>;

const AppEducationalAttainmentForm: FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEducationalAttainment, setSelectedEducationalAttainment] = useState<number | null>(null);

    const queryClient = useQueryClient();

    const { mutate: createEducationalAttainment, isPending: isCreating } = useCreateEducatinalAttainment();
    const { mutate: deleteEducationalAttainment, isPending: isDeleting } = useDeleteEducatinalAttainment();
    const { data: educationalAttainments, isPending: isFetching } = useGetEducationalAttainments(Number(user?.id));

    const form = useForm<ResumeInput>({
        resolver: zodResolver(inputSchema),
        defaultValues: {}
    });

    const onSubmit = async (inputs: ResumeInput) => {
        setLoading(true);

        const educationalAttainments = {
            ...inputs,
            user_id: Number(user?.id),
            end_date: inputs.is_current ? undefined : inputs.end_date,
            is_current: inputs.is_current ?? false,
        };

        createEducationalAttainment(educationalAttainments, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['educational-attainments', user.id] });

                form.reset({
                    institution_name: '',
                    degree: '',
                    field_of_study: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                    is_current: false,
                });
            },
            onError: (error) => {
                console.error('Failed to create educational attainment:', error);
            },
        });

        setLoading(false);
    };


    const handleOpenDialog = (resumeId: number) => {
        setSelectedEducationalAttainment(resumeId);
        setOpenDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedEducationalAttainment) return;

        deleteEducationalAttainment(selectedEducationalAttainment, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['educational-attainments', Number(user?.id)] });
            },
            onError: (error) => {
                console.error('Failed to delete:', error);
            },
            onSettled: () => {
                setSelectedEducationalAttainment(null);
            }
        });

        setOpenDialog(false);
    };

    return (
        <>
            <Card className="mt-5 p-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="py-10">
                            <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                                {/* Institution Name */}
                                <FormItem>
                                    <FormLabel>Institution Name</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="institution_name"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input placeholder="Enter institution name" {...field} />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Degree */}
                                <FormItem>
                                    <FormLabel>Degree</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="degree"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input placeholder="Enter degree" {...field} />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Field of Study */}
                                <FormItem>
                                    <FormLabel>Field of Study (Optional)</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="field_of_study"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input placeholder="Enter field of study" {...field} />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Start Date */}
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="start_date"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input type="date" {...field} />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* End Date */}
                                <FormItem>
                                    <FormLabel>End Date (Optional)</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="end_date"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    disabled={form.watch("is_current")}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Description */}
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="description"
                                            control={form.control}
                                            render={({ field }) => (
                                                <textarea
                                                    className="w-full p-2 border rounded"
                                                    placeholder="Enter a brief description"
                                                    rows={4}
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Is Current */}
                                <FormItem>
                                    <FormControl>
                                        <Controller
                                            name="is_current"
                                            control={form.control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.checked);
                                                            if (e.target.checked) {
                                                                form.setValue('end_date', '');
                                                            }
                                                        }}
                                                    />
                                                    <FormLabel>Currently Studying Here</FormLabel>
                                                </div>
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </div>


                            <div className="mt-16 text-right">
                                <Button
                                    type="submit"
                                    variant="default"
                                    className="text-white"
                                    disabled={isCreating || loading}
                                >
                                    {loading ? <AppSpinner /> : 'Save'}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Form>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <h2 className="text-lg font-bold">Educational Attainment</h2>
                </CardHeader>
                <CardContent>
                    {isFetching ? (
                        <Loader2 className="animate-spin mx-auto" size={32} />
                    ) : (
                        <div className="grid gap-4">
                            {educationalAttainments?.data?.length ? (
                                Array.isArray(educationalAttainments.data) && educationalAttainments.data.map((attainment: EducationalAttainment) => (
                                    <div key={attainment.id} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition">

                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{attainment.institution_name || 'N/A'}</h3>
                                                <p className="text-sm text-gray-600">{attainment.degree || 'N/A'}</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDialog(attainment.id!)}
                                                disabled={isDeleting}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="text-sm text-gray-500 space-y-2">

                                            <p>
                                                <span className="font-semibold">Field of Study:</span>
                                                {attainment.field_of_study || 'N/A'}
                                            </p>

                                            <p>
                                                <span className="font-semibold">Duration:</span>
                                                {attainment.start_date
                                                    ? `${formatDate(attainment.start_date)} – ${attainment.is_current ? 'Present' : formatDate(attainment.end_date ?? '')}`
                                                    : 'N/A'}
                                            </p>

                                            {attainment.description && (
                                                <p>
                                                    <span className="font-semibold">Description:</span>
                                                    {attainment.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No educational attainments found.</p>
                            )}
                        </div>

                    )}
                </CardContent>
            </Card>


            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete your educational attainment?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setOpenDialog(false);
                            setSelectedEducationalAttainment(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            {isDeleting ? <AppSpinner className='mx-auto' /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AppEducationalAttainmentForm;
