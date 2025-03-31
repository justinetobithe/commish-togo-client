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
import { Editor } from '@tinymce/tinymce-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useCreatePost, useUpdatePost } from '@/lib/PostAPI';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post } from '@/types/Post';
import AppSpinner from './AppSpinner';
import { QueryClient } from '@tanstack/react-query';
import Select from 'react-select';
import { useRef } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { api } from '@/lib/api';
import User from '@/types/User';
import { Service } from '@/types/Service';
import { toast } from '@/components/ui/use-toast';

const typeOptions = [
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" }
];

const postSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(3, "Title must be at least 3 characters long"),
    content: z.string().min(10, "Content must be at least 10 characters long"),
    location: z.string().optional(),
    salary: z.string().optional(),
    service_id: z.array(z.number()).optional(),
    type: z.string().min(1, "Type is required"),
    application_deadline: z.union([z.date(), z.null()]).optional(),
})

export type PostInput = z.infer<typeof postSchema>;

interface AppPostFormProps {
    data?: Post;
    isOpen: boolean;
    onClose: () => void;
    queryClient: QueryClient;
}

const AppPostForm: FC<AppPostFormProps> = ({ data, isOpen, onClose, queryClient }) => {
    const [loading, setLoading] = useState(false);
    const editorRef = useRef<Editor | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get<{ data: Service[] }>('/api/services');
                setServices(response.data.data);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };
        fetchServices();
    }, []);

    const form = useForm<PostInput>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            id: data?.id,
            title: data?.title || '',
            content: data?.content || '',
            location: data?.location || '',
            salary: data?.salary || '',
            type: data?.type || '',
            service_id: data?.tags?.map(service => service.id).filter(id => id !== undefined) ?? [],
            application_deadline: data?.application_deadline ? new Date(data.application_deadline) : null,
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                title: data.title || "",
                content: data.content || "",
                location: data.location || "",
                salary: data.salary || "",
                type: data.type || "",
                service_id: data.tags
                    ?.map(service => service.id)
                    .filter(id => id !== undefined) ?? [],
                application_deadline: data?.application_deadline ? new Date(data.application_deadline) : null,
            });
        }
    }, [data, form]);

    const { mutate: createPost, isPending: isCreating } = useCreatePost();
    const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();

    const onSubmit = async (formData: PostInput) => {
        if (formData.content) {
            formData.content = (editorRef.current as any).getContent() || "";
        }

        setLoading(true);
        if (data?.id) {
            await updatePost({ id: data.id, postData: formData }, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                },
            });
        } else {
            await createPost(formData, {
                onSettled: () => {
                    onClose();
                    queryClient.invalidateQueries({ queryKey: ['posts'] });
                },
            });
        }
        setLoading(false);
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="max-w-4xl w-full">
                <AlertDialogHeader>
                    <AlertDialogTitle>{data ? 'Edit Post' : 'Add Post'}</AlertDialogTitle>
                </AlertDialogHeader>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <FormField
                                control={form.control}
                                name='title'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input type='text' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Editor
                                className="form-control"
                                apiKey="rmaraoxct4iqpbk2ur478gvlxmdpuekuur95ua0latdnclkq"
                                placeholder=""
                                onInit={(evt: any, editor: any) => {
                                    editorRef.current = editor;
                                    editor.setContent(form.getValues('content') || "");
                                }}
                                initialValue={data?.content || ""}
                                onEditorChange={(newContent: string) => {
                                    form.setValue("content", newContent, { shouldDirty: true, shouldValidate: true });
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
                                    selector: 'textarea',

                                }}
                            />

                            <FormField
                                control={form.control}
                                name="service_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service</FormLabel>
                                        <FormControl>
                                            <Select
                                                isMulti
                                                options={services.map(service => ({
                                                    value: service.id,
                                                    label: service.name
                                                }))}
                                                onChange={selected => field.onChange(selected.map(option => option.value))}
                                                value={services
                                                    .filter(service => field.value?.includes(service.id!))
                                                    .map(service => ({
                                                        value: service.id,
                                                        label: service.name
                                                    }))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField control={form.control} name='location' render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input type='text' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name='salary' render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salary</FormLabel>
                                    <FormControl>
                                        <Input type='text' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Controller
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <Select
                                                    value={typeOptions.find(option => option.value === field.value) || null}
                                                    onChange={(option) => {
                                                        field.onChange(option?.value);
                                                    }}
                                                    options={typeOptions}
                                                />
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="application_deadline"
                                render={({ field }) => (
                                    <FormItem>  <FormLabel>Application Deadline</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                onChange={(date) => field.onChange(date || null)}
                                                value={field.value || null}
                                                format="MMMM d, yyyy"
                                                locale="en-US"
                                                clearIcon={null}
                                                minDate={new Date()}
                                            />
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

export default AppPostForm;
