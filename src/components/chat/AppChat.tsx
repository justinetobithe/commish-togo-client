"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useUsers } from '@/lib/UsersAPI'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from '@/types/Message'
import User from '@/types/User'
import { useSession } from 'next-auth/react'
import { useGetMessages, useSendMessage } from '@/lib/MessageAPI'
import { laravelEcho } from '@/utils/pusher'
import moment from 'moment'
import { cn } from '@/utils/cn'

export default function AppChat() {
    /* STATE */
    const {data: users} = useUsers(1, null);
    const [selectedChatItem, setSelectedChatItem] = useState<{
        user: User|null,
        messages: Message[]
    }>({user: null, messages: []});
    const session = useSession()
    const [message, setMessage] = useState('')
    const {mutate: sendMessage, isPending} = useSendMessage()
    const [messages, setMessages] = useState<Message[]>([])
    const {data} = useGetMessages(selectedChatItem.user?.id?.toString() || null)
    const effectRan = useRef(false)
    const messageListRef = useRef<HTMLDivElement | null>(null);

    /* EFFECTS */
    useEffect(() => {
        if(data) {
            setMessages(data)
        }
    }, [data])

    useEffect(() => {
        if (!effectRan.current && session.data) {
            laravelEcho()
                .private('message.sent')
                .listen('MessageSent', (response: {data: Message}) => {
                    const {data} = response 
                    if(data.recipient_id.toString() == session.data?.user.id.toString() || data.sender_id.toString() == session.data.user.id) {
                        setMessages((state) => [...state, data])
                        // SCROLL TO BOTTOM
                        setTimeout(() => {
                            if (messageListRef.current) {
                              messageListRef.current.scrollIntoView({
                                behavior: 'instant',
                              });
                            }
                          }, 500);
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
    const handleSelectChatItem = (user: User) => {
        setSelectedChatItem({
            user,
            messages: []
        })
    }

    const handleSendMessage = (id: string) => {
        sendMessage({
            recipient_id: id,
            message: message
        }, {
            onSettled: () => {
                setMessage('')
            }
        })
    }

    useEffect(() => {
        if (messageListRef.current && selectedChatItem.user) {
          messageListRef.current.scrollIntoView({
            behavior: 'instant',
          });
        }
      }, [messageListRef, selectedChatItem]);

  return (
        <div className="flex overflow-hidden">
         {/* Sidebar */}
        <div className="w-1/4 bg-white border-r border-gray-300">
           {/* Sidebar Header */}
          <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-primary text-white">
            <h1 className="text-2xl font-semibold">Chat</h1>
            <div className="relative">
              <button id="menuButton" className="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-100" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </header>
        
           {/* Contact List */}
          <div className="overflow-y-auto max-h-[800px] p-3 mb-9 pb-20">
            {users && users.data ? users.data?.filter(item => item.id !== session.data?.user.id).map(item => (
            <div className={cn("flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md", {'bg-gray-100': item.id == selectedChatItem.user?.id})} onClick={() => handleSelectChatItem(item)} key={item.id}>
              <Avatar className='w-12 h-12 bg-gray-300 rounded-full mr-3'>
                <AvatarImage src={item.image ?? ''} />
                <AvatarFallback>{item.first_name.charAt(0).toUpperCase()}{item.last_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.first_name} {item.last_name}</h2>
                {/* <p className="text-gray-600">Hoorayy!!</p> */}
              </div>
            </div>
            )) : null}
          </div>
        </div>
        
         {/* Main Chat Area */}
         {selectedChatItem.user ? (
            <div className="flex-1 relative">
                {/* Chat Header */}
                <header className="bg-white p-4 text-gray-700">
                    <h1 className="text-2xl font-semibold">{selectedChatItem.user.first_name} {selectedChatItem.user.last_name}</h1>
                </header>
                
                {/* Chat Messages */}
                <div className="max-h-[500px] overflow-y-auto p-4">
                    {messages.map(item => (
                        <React.Fragment key={item.id}>
                        {item.recipient_id == selectedChatItem.user?.id ? (
                            <div className="flex justify-end mb-4 cursor-pointer">
                                <div>
                                    <div className="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
                                        <p>{item.content}</p>
                                    </div>
                                    <p className='text-xs'>{moment(item.created_at).fromNow()}</p>
                                </div>
                                <Avatar className='w-9 h-9 rounded-full flex items-center justify-center ml-2'>
                                    <AvatarImage src={session.data?.user.image ?? ''} />
                                    <AvatarFallback>{session.data?.user.first_name.charAt(0).toUpperCase()}{session.data?.user.last_name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <div className="flex mb-4 cursor-pointer">
                                <Avatar className='w-9 h-9 rounded-full flex items-center justify-center mr-2'>
                                    <AvatarImage src={selectedChatItem.user?.image ?? ''} />
                                    <AvatarFallback>{selectedChatItem.user?.first_name.charAt(0).toUpperCase()}{selectedChatItem.user?.last_name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                                        <p className="text-gray-700">{item.content}</p>
                                    </div>
                                    <p className="text-xs text-gray-700">{moment(item.created_at).fromNow()}</p>
                                </div>
                            </div>
                        )}
                        </React.Fragment>
                    ))}
                    <div ref={messageListRef}></div>
                </div>
                
                {/* Chat Input */}
                <footer className="bg-white border-t border-gray-300 p-4 w-full">
                    <div className="flex items-center">
                        <input type="text" placeholder="Type a message..." className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500" value={message} onChange={(e) => setMessage(e.target.value)} disabled={isPending}/>
                        <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2" onClick={() => {
                            if(selectedChatItem && selectedChatItem.user) {
                                handleSendMessage(selectedChatItem.user.id as string)
                            }
                        }} disabled={isPending}>Send</button>
                    </div>
                </footer>
            </div>
         ) : null}
    </div>
  )
}
