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
import { useCreateResume, useDeleteResume, useGetUserResume } from '@/lib/ResumeAPI';
import { Trash2, FileText, File, Loader2, ExternalLink } from 'lucide-react';
import { Resume } from '@/types/Resume';
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

import { toast } from '@/components/ui/use-toast';

const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const resumeSchema = z.object({
    file: z
        .any()
        .refine((file) => file && file[0], 'File is required')
        // .refine((file) => ACCEPTED_FILE_TYPES.includes(file[0]?.type), 'Invalid file type')
        // .refine((file) => file[0]?.size <= MAX_FILE_SIZE, 'File size should be under 5MB')
});

export type ResumeInput = z.infer<typeof resumeSchema>;

const AppResumeUploadForm: FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

    const queryClient = useQueryClient();

    const { mutate: uploadResume, isPending: isUploading } = useCreateResume();
    const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();
    const { data: resumes, isPending: isFetching } = useGetUserResume(Number(user?.id));

    const form = useForm<ResumeInput>({
        resolver: zodResolver(resumeSchema),
        defaultValues: {}
    });

    const onSubmit = async (inputs: ResumeInput) => {
        if (!inputs.file || inputs.file.length === 0) {
            toast({
                variant: 'destructive',
                description: 'Please select a file before uploading.',
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('file', inputs.file[0]);
        formData.append('user_id', String(user?.id));

        uploadResume(formData as Resume, {
            onSuccess: () => {
                form.reset({ file: undefined });
                queryClient.invalidateQueries({ queryKey: ['resumes', Number(user?.id)] });
                toast({
                    variant: 'success',
                    description: 'Resume uploaded successfully!',
                });
            },
            onError: (error) => {
                console.error('Upload failed:', error);
                toast({
                    variant: 'destructive',
                    description: 'Failed to upload resume. Please try again.',
                });
            },
            onSettled: () => {
                setLoading(false);
            }
        });
    };


    const openResume = (resumeUrl: string) => {
        const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/storage/resumes/${resumeUrl}`;
        window.open(fullUrl, '_blank');
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return <FileText className="text-red-500" />;
        if (fileType.includes('word')) return <File className="text-blue-500" />;
        return <File className="text-gray-500" />;
    };

    const handleOpenDialog = (resumeId: number) => {
        setSelectedResumeId(resumeId);
        setOpenDialog(true);
    };

    const handleConfirmDelete = () => {
        if (selectedResumeId) {
            deleteResume(selectedResumeId, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['resumes', Number(user?.id)] });
                },
                onError: (error) => {
                    console.error('Failed to delete:', error);
                }
            });
        }
        setOpenDialog(false);
        setSelectedResumeId(null);
    };

    return (
        <>
            <Card className="mt-5 p-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="py-10">
                            <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                                <FormItem>
                                    <FormLabel>Upload Resume</FormLabel>
                                    <FormControl>
                                        <Controller
                                            name="file"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
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
                                    disabled={isUploading || loading}
                                >
                                    {loading ? <AppSpinner /> : 'Upload'}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Form>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <h2 className="text-lg font-bold">Uploaded Resumes</h2>
                </CardHeader>
                <CardContent>
                    {isFetching ? (
                        <Loader2 className="animate-spin mx-auto" size={32} />
                    ) : (
                        <div className="grid gap-4">
                            {resumes?.data?.length ? (
                                resumes?.data.map((resume) => (
                                    <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                                        <div className="flex items-center gap-4">
                                            {getFileIcon(resume?.file_type as string)}

                                            <div>
                                                <button
                                                    onClick={() => openResume(resume?.file_path as string)}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    {resume.file_name}
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                {resume?.file_size !== undefined && (
                                                    <p className="text-sm text-gray-500">
                                                        {(resume.file_size / 1024).toFixed(2)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDialog(resume.id!)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No resumes uploaded yet.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this resume?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            {isDeleting ? <AppSpinner className='mx-auto' /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AppResumeUploadForm;
