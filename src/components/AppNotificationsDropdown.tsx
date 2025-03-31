import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Notification } from "@/types/Notification";

interface AppNotificationsDropdownProps {
    notifications: Notification[];
}

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

const AppNotificationsDropdown: React.FC<AppNotificationsDropdownProps> = ({ notifications }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <div className='relative'>
            <button
                aria-label='Notifications'
                className='p-2 rounded-full hover:bg-gray-200 transition relative'
                onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
                <Bell className='w-5 h-5 text-gray-600' />
                {notifications.length > 0 && (
                    <span className='absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center'>
                        {notifications.length}
                    </span>
                )}
            </button>

            {notificationsOpen && (
                <div className='absolute right-0 mt-2 bg-white shadow-lg rounded-md w-96 py-2 max-h-80 overflow-auto z-[9999]'>
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div key={notif.id} className='flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer space-x-3'>
                                <Avatar className={`w-10 h-10 flex-shrink-0 ${getRandomColor()} text-white font-bold flex items-center justify-center rounded-full`}>
                                    <AvatarFallback>{notif.title?.charAt(0).toUpperCase() || "N"}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className='font-semibold'>{notif.title || "Notification"}</p>
                                    <p className='text-sm text-gray-500'>{notif.body}</p>
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
