import React, { FC, useEffect, useState } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from './ui/button';
import { Post } from '@/types/Post';
import { Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from '@/lib/api';

interface AppPostDetailsDrawerProps {
    data?: Post;
    isOpen: boolean;
    onClose: () => void;
}

const AppPostDetailsDrawer: FC<AppPostDetailsDrawerProps> = ({ data, isOpen, onClose }) => {
    const [likePosts, setLikePosts] = useState<{ [key: number]: boolean }>({});
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<'applicants' | 'comments'>('applicants'); // State for toggling tabs

    useEffect(() => {
        if (data?.id) {
            const fetchRelatedPosts = async () => {
                try {
                    const response = await api.get<{ data: Post[] }>("/api/posts");
                    setRelatedPosts(response.data.data);
                } catch (error) {
                    console.error("Error fetching posts:", error);
                }
            };
            fetchRelatedPosts();
        }
    }, [data]);

    const toggleLike = (id: number) => {
        setLikePosts((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{data?.title}</DrawerTitle>
                    <p className="text-gray-600 text-sm mb-4">By {data?.user?.first_name} {data?.user?.last_name}</p>
                </DrawerHeader>
                <div className="p-4">
                    <div className="mb-2">
                        <h3 className="text-lg font-semibold">Post Details</h3>
                        <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: data?.content || "" }} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {data?.tags?.map((tag) => (
                            <span
                                key={tag.id}
                                className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    <p className="text-gray-600 text-xs mb-4">{formatDistanceToNow(new Date(data?.created_at!))} ago</p>

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggleLike(data!.id!)}>
                                <Heart className={`w-5 h-5 ${likePosts[data!.id!] ? "text-red-500" : "text-gray-400"}`} />
                            </button>
                            <span>{data?.likes?.length} Likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                            <span>{data?.comments?.length} Comments</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex mb-2">
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'applicants' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                onClick={() => setActiveTab('applicants')}
                            >
                                Applicants
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                Comments
                            </button>
                        </div>

                        {activeTab === 'applicants' && (
                            <div>
                                <h4 className="font-semibold text-md">Applicants</h4>
                                {data?.applicants?.map((applicant) => (
                                    <div key={applicant.id} className="flex items-start mb-3 mt-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                            {applicant.user?.image ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/image/${applicant.user.image}`} alt="avatar" className="w-full h-full rounded-full" />
                                            ) : (
                                                <span className="text-white text-lg">{applicant.user?.first_name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{applicant.user?.first_name} {applicant.user?.last_name}</span>
                                                <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(applicant.created_at!))} ago</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div>
                                <h4 className="font-semibold text-md">Comments</h4>
                                {data?.comments?.map((comment) => (
                                    <div key={comment.id} className="flex items-start mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                            {comment.user?.image ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/image/${comment.user.image}`} alt="avatar" className="w-full h-full rounded-full" />
                                            ) : (
                                                <span className="text-white text-lg">{comment.user?.first_name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{comment.user?.first_name} {comment.user?.last_name}</span>
                                                <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(comment.created_at!))} ago</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1" dangerouslySetInnerHTML={{ __html: comment.comment || "" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DrawerFooter>
                    <div className="mb-4">
                        <h4 className="font-semibold text-md">Related Posts</h4>
                        {relatedPosts.slice(0, 3).map((post) => (
                            <div key={post.id} className="border-t py-2">
                                <a href={`/posts/${post.id}`} className="text-blue-500 hover:underline">{post.title}</a>
                                <p className="text-sm text-gray-600">{formatDistanceToNow(new Date(post.created_at!))} ago</p>
                            </div>
                        ))}
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default AppPostDetailsDrawer;
