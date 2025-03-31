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
import { useCreateWorkExperience, useDeleteWorkExperience, useGetWorkExperiences } from '@/lib/WorkExperienceAPI';
import { WorkExperience } from '@/types/WorkExperience';

const inputSchema = z
    .object({
        company_name: z.string().min(1, 'Company name is required'),
        position: z.string().min(1, 'Position is required'),
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

const AppWorkExperienceForm: FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedWorkExperience, setSelectedWorkExperience] = useState<number | null>(null);

    const queryClient = useQueryClient();

    const { mutate: createWorkExperience, isPending: isCreating } = useCreateWorkExperience();
    const { mutate: deleteWorkExperience, isPending: isDeleting } = useDeleteWorkExperience();
    const { data: workExperiences, isPending: isFetching } = useGetWorkExperiences(Number(user?.id));

    const form = useForm<ResumeInput>({
        resolver: zodResolver(inputSchema),
        defaultValues: {}
    });

    const onSubmit = async (inputs: ResumeInput) => {
        setLoading(true);

        const workExperienceData = {
            ...inputs,
            user_id: Number(user?.id),
            end_date: inputs.is_current ? undefined : inputs.end_date,
        };

        createWorkExperience(workExperienceData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['work-experiences', user.id] });

                form.reset({
                    company_name: '',
                    position: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                    is_current: false,
                });
            },
            onError: (error) => {
                console.error('Failed to create work experience:', error);
            },
        });

        setLoading(false);
    };


    const handleOpenDialog = (resumeId: number) => {
        setSelectedWorkExperience(resumeId);
        setOpenDialog(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedWorkExperience) return;

        deleteWorkExperience(selectedWorkExperience, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['work-experiences', Number(user?.id)] });
            },
            onError: (error) => {
                console.error('Failed to delete:', error);
            },
            onSettled: () => {
                setSelectedWorkExperience(null);
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

                                {/* Company Name */}
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="company_name"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input placeholder="Enter company name" {...field} />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                                {/* Position */}
                                <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="position"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input placeholder="Enter position" {...field} />
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
                                                    <FormLabel>Currently Working Here</FormLabel>
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
                    <h2 className="text-lg font-bold">Work Experiences</h2>
                </CardHeader>
                <CardContent>
                    {isFetching ? (
                        <Loader2 className="animate-spin mx-auto" size={32} />
                    ) : (
                        <div className="grid gap-4">
                            {workExperiences?.data?.length ? (
                                workExperiences && Array.isArray(workExperiences.data) && workExperiences.data.map((experience: WorkExperience) => (
                                    <div key={experience.id} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{experience.company_name}</h3>
                                                <p className="text-sm text-gray-600">{experience.position}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDialog(experience.id!)}
                                                disabled={isDeleting}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            <p className="mb-2">
                                                <span className="font-semibold">Duration:</span>
                                                {experience.start_date
                                                    ? `${formatDate(experience.start_date)} – ${experience.is_current ? 'Present' : formatDate(experience.end_date ?? '')}`
                                                    : 'N/A'}
                                            </p>
                                            {experience.description && (
                                                <p className="text-gray-700 mt-2 leading-relaxed">{experience.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No work experiences found.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>


            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete your work experience?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setOpenDialog(false);
                            setSelectedWorkExperience(null);
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

export default AppWorkExperienceForm;
