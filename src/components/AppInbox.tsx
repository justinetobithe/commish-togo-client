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

const inputSchema = z.object({
    content: z.string().min(1, { message: 'Message cannot be empty' }),
});

export type MessageInputs = z.infer<typeof inputSchema>;

const AppInbox: FC = () => {
    // const [users, setUsers] = useState<any[]>([
    //     { id: 1, first_name: 'LeBron', last_name: 'James', email: 'lebron@nba.com', image: '/path/to/lebron.jpg', latest_message: 'Hey, I will be in town tomorrow.', last_message_time: '2025-02-18T08:00:00Z' },
    //     { id: 2, first_name: 'Stephen', last_name: 'Curry', email: 'stephen@nba.com', image: '/path/to/curry.jpg', latest_message: 'Got your message, will reply later.', last_message_time: '2025-02-17T18:45:00Z' },
    //     { id: 3, first_name: 'Kevin', last_name: 'Durant', email: 'kevin@nba.com', image: '/path/to/durant.jpg', latest_message: 'Can’t wait to catch up!', last_message_time: '2025-02-18T12:30:00Z' }
    // ]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const messageListRef = useRef<HTMLLIElement | null>(null);
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const { mutate: sendMessage } = useSendMessage();
    const form = useForm<MessageInputs>({ resolver: zodResolver(inputSchema) });

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
        <div className='flex h-1/2 border rounded-lg overflow-hidden'>
            <div className='w-1/3 bg-gray-100 border-r p-4'>
                <h2 className='text-lg font-bold mb-4'>Users</h2>
                {/* <ul>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className={`p-2 cursor-pointer rounded-lg ${selectedUser?.id === user.id ? 'border-primary bg-gray-200' : 'hover:bg-gray-200'}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className='flex items-center space-x-3'>
                                <Avatar className='h-10 w-10'>
                                    <AvatarImage src={user.image || undefined} className='object-cover' />
                                    <AvatarFallback>
                                        {user.first_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span>{user.first_name} {user.last_name}</span>
                                    <span className='text-sm text-gray-500'>{user.email}</span>
                                    <span className='text-xs text-gray-400'>{`${moment(user.last_message_time).fromNow()}: ${user.latest_message}`}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul> */}
            </div>

            <div className='w-2/3 flex flex-col'>
                {/* {selectedUser ? (
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
                ) : ( */}
                <div className='flex-1 flex items-center justify-center text-gray-500'>
                    Select a user to start a conversation
                </div>
                {/* )} */}
            </div>
        </div>
    );
};

export default AppInbox;
