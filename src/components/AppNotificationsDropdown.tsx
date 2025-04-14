import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import Notification from "@/types/Notification";
import User from "@/types/User";
import { api } from "@/lib/api";
import { useGetUserNotifications, useMarkAsRead } from "@/lib/UsersAPI";
import { laravelEcho } from "@/utils/pusher";
import {produce} from "immer";
import { useSession } from "next-auth/react";
import Response from "@/types/Response";
import { cn } from "@/utils/cn";

const getRandomColor = () => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
    return colors[Math.floor(Math.random() * colors.length)];
};

const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const AppNotificationsDropdown: React.FC = () => {
    /* STATE */
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const effectRan = useRef(false)
    const session = useSession();
    const { data, refetch } = useGetUserNotifications(session.data?.user.id);
    const { mutate: markAsRead } = useMarkAsRead()

    /* EFFECTS */

    useEffect(() => {
        if(data) {
            setNotifications(data)
        }
    }, [data])

	useEffect(() => {
        if (!effectRan.current && session.data) {
            laravelEcho()
                .private('App.Models.User.' + session.data?.user.id)
                .notification((notification: {
                    user: string,
                    message: string,
                    original_user_id: number
                }) => {
                    if(notification.original_user_id.toString() == session.data?.user.id) {
                        refetch()
                    }
                })
            }
            return () => {
                if(session.data) {
                    effectRan.current = true
                }
            }
	}, [session.data])

    /* HANDLERS */
    const handleMarkAsRead = (id: string | number) => {
        markAsRead({
            id
        }, {
            onSuccess: (response) => {
                if(response.success) {
                    setNotifications(
                        produce(state => {
                            const itemIndex = state.findIndex(v => v.id == id)
                            if (itemIndex > -1) {
                                state[itemIndex].read_at = response.data?.read_at as string
                            }
                        })
                    )
                }
            }
        })
    }

    return (
        <div className='relative'>
            <button
                aria-label='Notifications'
                className='p-2 rounded-full hover:bg-gray-200 transition relative'
                onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
                <Bell className='w-5 h-5 text-gray-600' />
                {notifications && notifications.filter(item => !item.read_at).length > 0 && (
                    <span className='absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center'>
                        {notifications.filter(item => !item.read_at).length}
                    </span>
                )} 
            </button>

            {notificationsOpen && (
                <div className='absolute right-0 mt-2 bg-white shadow-lg rounded-md w-96 py-2 max-h-80 overflow-auto z-[9999]'>
                    {notifications ? (
                        notifications.map((notif) => (
                            <div key={notif.id} className='flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer space-x-3' onClick={() => handleMarkAsRead(notif.id)}>
                                <Avatar className={`w-10 h-10 flex-shrink-0 ${getRandomColor()} text-white font-bold flex items-center justify-center rounded-full`}>
                                    <AvatarFallback>{notif.data.user?.charAt(0).toUpperCase() || "N"}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className={cn({'font-semibold': !notif.read_at}) }>{notif.data.user || "Notification"}</p> 
                                    <p className='text-sm text-gray-500'>{notif.data.message}</p>
                                    <p className='text-xs text-gray-400'>{timeAgo(notif.created_at)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='px-4 py-2 text-gray-500'>No new notifications</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AppNotificationsDropdown;
