'use client';

import React, { FC, useEffect, useState, useRef, Fragment } from 'react';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { SendHorizontal } from 'lucide-react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { getMessages, useSendMessage } from '@/lib/MessageAPI';
import moment from 'moment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from './ui/input';
import { Message } from '@/types/Message';
import User from '@/types/User';
import { getUsers } from '@/lib/UsersAPI';

const inputSchema = z.object({
    content: z.string().min(1, { message: 'Message cannot be empty' }),
});

export type MessageInputs = z.infer<typeof inputSchema>;

const AppInbox: FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const messageListRef = useRef<HTMLLIElement | null>(null);
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const { mutate: sendMessage } = useSendMessage();
    const form = useForm<MessageInputs>({ resolver: zodResolver(inputSchema) });

    /* FETCH USERS */
    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getUsers();
            setUsers(users);
        };
        fetchUsers();
    }, []);

    /* FETCH MESSAGES */
    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                const messages = await getMessages(selectedUser.id!.toString());
                setMessages(messages);
            };
            fetchMessages();
        }
    }, [selectedUser]);

    const onSubmit = (data: MessageInputs) => {
        if (!selectedUser) return;
        sendMessage(
            { recipient_id: selectedUser.id!.toString(), data },
            {
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                    form.reset({ content: '' });
                },
            }
        );
    };

    return (
        <div className='flex h-screen border rounded-lg overflow-hidden'>
            {/* User List Sidebar */}
            <div className='w-1/3 bg-gray-100 border-r p-4'>
                <h2 className='text-lg font-bold mb-4'>Users</h2>
                <ul>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className={`p-2 cursor-pointer rounded-lg ${selectedUser?.id === user.id ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className='flex items-center space-x-3'>
                                <Avatar className='h-10 w-10'>
                                    <AvatarImage src={user.image || undefined} className='object-cover' />
                                    <AvatarFallback>
                                        {user.first_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>1
                                <span>{user.first_name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Section */}
            <div className='w-2/3 flex flex-col'>
                {selectedUser ? (
                    <>
                        <div className='p-4 border-b flex items-center space-x-3'>
                            <Avatar className='h-12 w-12'>
                                <AvatarImage src={selectedUser.image || undefined} className='object-cover' />
                                <AvatarFallback>{selectedUser.first_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <h2 className='text-xl font-bold'>{selectedUser.first_name}</h2>
                        </div>
                        <div className='flex-1 overflow-y-auto p-4'>
                            {messages.length ? (
                                <ul className='space-y-5'>
                                    {messages.map((item) => (
                                        <Fragment key={item.id}>
                                            {item.sender_id.toString() == session?.user.id ? (
                                                <li className='flex justify-end'>
                                                    <div className='bg-primary text-white px-4 py-3 rounded-lg'>
                                                        {item.content}
                                                    </div>
                                                </li>
                                            ) : (
                                                <li className='flex justify-start'>
                                                    <div className='bg-gray-200 px-4 py-3 rounded-lg'>
                                                        {item.content}
                                                    </div>
                                                </li>
                                            )}
                                        </Fragment>
                                    ))}
                                    <li ref={messageListRef}></li>
                                </ul>
                            ) : (
                                <p className='text-gray-500 text-center'>No messages yet.</p>
                            )}
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='p-4 border-t flex'>
                                <FormField
                                    control={form.control}
                                    name='content'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormControl>
                                                <Input
                                                    placeholder='Type a message...'
                                                    {...field}
                                                    className='p-2 rounded-l-lg border focus:ring-0 focus:outline-none'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type='submit' className='rounded-r-lg px-4'>
                                    <SendHorizontal />
                                </Button>
                            </form>
                        </Form>
                    </>
                ) : (
                    <div className='flex-1 flex items-center justify-center text-gray-500'>
                        Select a user to start a conversation
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppInbox;
