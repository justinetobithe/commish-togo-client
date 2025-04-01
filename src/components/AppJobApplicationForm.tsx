import React, { FC, useEffect, useState, useRef } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Form, FormControl, FormDescription, FormField, FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'; 
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post } from '@/types/Post';
import AppSpinner from './AppSpinner';
import { QueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import User from '@/types/User';
import { useCreateJobApplication, useUpdateJobApplication } from '@/lib/JobApplicationAPI';
import { JobApplication } from '@/types/JobApplication';
import { toast } from '@/components/ui/use-toast';
import { Resume } from '@/types/Resume';
import Select from 'react-select';

const jobApplicationSchema = z.object({
    id: z.number().optional(),
    user_id: z.number().optional(),
    post_id: z.number().optional(),
    cover_letter: z.string().min(10, "Content must be at least 10 characters long"),
    resume_id: z.number().optional(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

interface AppJobApplicationFormProps {
    post?: Post;
    data?: JobApplication;
    isOpen: boolean;
    onClose: () => void;
    queryClient: QueryClient;
}

const AppJobApplicationForm: FC<AppJobApplicationFormProps> = ({ post, data, isOpen, onClose, queryClient }) => {
    const [loading, setLoading] = useState(false);
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [resumes, setResumes] = useState<Resume[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get<{ data: User }>('/api/me');
                setUser(data.data);
                form.setValue('user_id', data.data.id as number);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await api.get<{ data: Resume[] }>('/api/resume/user');
                setResumes(response.data.data);
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };
        fetchResumes();
    }, []);

    const form = useForm<JobApplicationInput>({
        resolver: zodResolver(jobApplicationSchema),
        defaultValues: {
            id: data?.id,
            user_id: user ? Number(user?.id) : undefined,
            post_id: data?.post_id || post?.id,
            cover_letter: data?.cover_letter || '',
            resume_id: data?.resume_id || undefined,
        },
    });

    useEffect(() => {
        if (data) {
            setUser(null);
            setResumes([]);
            form.reset({
                user_id: user ? Number(user?.id) : undefined,
                post_id: data.post_id || post?.id,
                cover_letter: data.cover_letter || "",
                resume_id: data?.resume_id || undefined,
            });
        }
    }, [data, form, post?.id, user]);

    const { mutate: createJobApplication, isPending: isCreating } = useCreateJobApplication();
    const { mutate: updateJobApplication, isPending: isUpdating } = useUpdateJobApplication();

    const onSubmit = async (formData: JobApplicationInput) => {
        formData.cover_letter = editorRef.current?.getContent() || "";
        setLoading(true);

        if (data?.id) {
            await updateJobApplication({ id: data.id, jobApplicationData: formData }, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['job_applications'] });
                },
            });
        } else {
            await createJobApplication(formData, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['job_applications'] });
                },
            });
        }
        setLoading(false);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="max-w-4xl w-full">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {data ? `Edit ${post?.title || 'Job Application'}` : `Apply on this ${post?.title || 'Job Application'}`}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>

                            <div className="text-xl font-bold mb-2">Cover Letter</div>
                            <div className="form-control">
                                <Editor
                                    apiKey="rmaraoxct4iqpbk2ur478gvlxmdpuekuur95ua0latdnclkq"
                                    // placeholder=""
                                    // onInit={(evt: any, editor: any) => {
                                    //     editorRef.current = editor;
                                    //     editor.setContent(form.getValues('cover_letter') || "");
                                    // }}
                                    onInit={(evt, editor) => {
                                        editorRef.current = editor;
                                        editor.setContent(form.getValues('cover_letter') || "");
                                    }}
                                    initialValue={data?.cover_letter || ""}
                                    onEditorChange={(newCoverLetter: string) => {
                                        form.setValue("cover_letter", newCoverLetter, { shouldDirty: true, shouldValidate: true });
                                    }}
                                    init={{
                                        height: 500,
                                        menubar: 'view edit format table',
                                        plugins: [
                                            'advlist autolink lists link image charmap print preview anchor',
                                            'searchreplace visualblocks code fullscreen',
                                            'insertdatetime media table paste code help wordcount'
                                        ],
                                        toolbar: 'undo redo | formatselect | ' +
                                            'bold italic backcolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist outdent indent | ' +
                                            'removeformat | help',
                                        // selector: 'textarea',
                                    }}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="resume_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resume</FormLabel>
                                        <Select
                                            defaultValue={resumes.find(resume => resume.id === field.value) ? {
                                                value: field.value,
                                                label: resumes.find(resume => resume.id === field.value)?.file_name,
                                            } : null}
                                            options={resumes?.map(resume => ({
                                                value: resume.id!,
                                                label: resume.file_name,
                                            }))}
                                            onChange={option => field.onChange(option?.value)}
                                            isClearable
                                        />
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

export default AppJobApplicationForm;
