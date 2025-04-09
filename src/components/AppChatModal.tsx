'use client';
import React, {
    FC,
    Fragment,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import Pusher from 'pusher-js';
import log from '@/utils/logger';
import Echo from 'laravel-echo';
import { useSession } from 'next-auth/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { SendHorizontal } from 'lucide-react';
import z from 'zod';
import { strings } from '@/utils/strings';
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
    content: z
        .string({
            required_error: strings.validation.required,
        })
        .min(1, {
            message: strings.validation.required,
        }),
});

export type MessageInputs = z.infer<typeof inputSchema>;

const AppChatModal: FC<{
    recipient: User;
    buttonElem: ReactNode;
    isOpen: boolean;
    setIsOpen: () => void;
}> = ({ recipient, buttonElem, isOpen, setIsOpen }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    /* FETCH MESSAGES */
    useEffect(() => {
        if (isOpen) {
            const fetchMessages = async () => {
                const messages = await getMessages(recipient.id!.toString());
                setMessages(messages);
            };

            fetchMessages();
        }

        return () => {
            setMessages([]);
        };
    }, [isOpen]);

    const messageListRef = useRef<HTMLLIElement | null>(null);
    const queryClient = useQueryClient();
    const { mutate: sendMessage } = useSendMessage();

    const form = useForm<MessageInputs>({
        resolver: zodResolver(inputSchema),
    });

    const session = useSession();
    useEffect(() => {
        if (isOpen && session.data && !isInitialized) {
            setIsInitialized(true);
            const apiKey = process.env.NEXT_PUBLIC_PUSHER_API_KEY;
            log('[KEY]', apiKey);

            const channel = new Echo({
                broadcaster: 'pusher',
                key: apiKey,
                client: new Pusher(apiKey!, {
                    cluster: 'ap1',
                    forceTLS: true,
                    /* authorizer: (channel) => {
                      return {
                        authorize: (socketId, callback) => {
                          api
                            .post('/api/broadcasting/auth', {
                              socket_id: socketId,
                              channel_name: channel.name,
                            })
                            .then((response) => {
                              callback(null, response.data);
                            })
                            .catch((error) => {
                              callback(error, null);
                            });
                        },
                      };
                    }, */
                }),
            });

            channel
                // .private('chat')
                .channel('chat')
                .listen('MessageSent', (data: { message: Message }) => {
                    log('[MESSAGE]', data.message);
                    if (
                        data.message.sender_id.toString() == session.data.user.id.toString() ||
                        data.message.recipient_id.toString() == session.data.user.id.toString()
                    ) {
                        setMessages((state) => [...state, data.message]);
                        setTimeout(() => {
                            if (messageListRef.current) {
                                messageListRef.current.scrollIntoView({
                                    behavior: 'instant',
                                });
                            }
                        }, 500);
                    }
                });
        }
    }, [isOpen, session, isInitialized, queryClient]);

    const onOpenChange = () => {
        setIsOpen();
        setTimeout(() => {
            if (messageListRef.current) {
                messageListRef.current.scrollIntoView({
                    behavior: 'instant',
                });
            }
        }, 1000);
    };

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollIntoView({
                behavior: 'instant',
            });
        }
    }, [messageListRef]);

    const onSubmit = (data: MessageInputs) => {
        sendMessage(
            {
                recipient_id: recipient.id!.toString(),
                data,
            },
            {
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ['messages'] });
                    form.reset({
                        content: '',
                    });
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} defaultOpen>
            <DialogTrigger asChild>{buttonElem}</DialogTrigger>
            <DialogContent
                className='max-w-5xl p-16'
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className='border-b-2 border-primary pb-3'>
                    <div className='flex items-center space-x-3'>
                        <Avatar className='h-[80px] w-[80px]'>
                            <AvatarImage
                                src={recipient.image || undefined}
                                className='object-cover'
                            />
                            <AvatarFallback className='text-2xl font-bold'>
                                {recipient.first_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <DialogTitle className='text-2xl'>{recipient.first_name}</DialogTitle>
                    </div>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='flex flex-col items-stretch'>
                            <div className='max-h-[30rem] min-h-[30rem] flex-1 overflow-y-auto'>
                                {session.data &&
                                    session.data.user &&
                                    messages &&
                                    messages.length ? (
                                    <ul className='flex flex-col space-y-5'>
                                        {messages.map((item) => (
                                            <Fragment key={item.id}>
                                                {item.sender_id.toString() == session.data.user.id ? (
                                                    <li className='flex justify-end'>
                                                        <div>
                                                            <p className='mr-2 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl bg-primary px-4 py-3 text-foreground'>
                                                                {item.content}
                                                            </p>
                                                            <p>
                                                                <small>
                                                                    {moment(item.created_at).format('ddd hh:mmA')}
                                                                </small>
                                                            </p>
                                                        </div>
                                                    </li>
                                                ) : (
                                                    <li className='flex justify-start'>
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={recipient.image || undefined}
                                                                className='object-cover'
                                                            />
                                                            <AvatarFallback>
                                                                {recipient.first_name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className='ml-2 rounded-br-3xl rounded-tl-xl rounded-tr-3xl bg-[#F1F1F1] px-4 py-3 text-foreground'>
                                                                {item.content}
                                                            </p>
                                                            <p>
                                                                <small>
                                                                    {moment(item.created_at).format('ddd hh:mmA')}
                                                                </small>
                                                            </p>
                                                        </div>
                                                    </li>
                                                )}
                                                <li ref={messageListRef}></li>
                                            </Fragment>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                            <div>
                                <div className='flex'>
                                    <FormField
                                        control={form.control}
                                        name='content'
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Write something ...'
                                                        className='max-h-10 min-h-0 resize-none rounded-e-none px-2 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className='rounded-s-none'>
                                        <SendHorizontal />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AppChatModal;
