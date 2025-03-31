"use client";

import React, { useEffect, useState } from "react";
import { Heart, X, Plus, Search, Loader, Pen } from "lucide-react";
import AppPostForm from "@/components/AppPostForm";
import { useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/Post";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import AppPostDetailsDrawer from "@/components/AppPostDetailsDrawer";
import { debounce } from "lodash";
import User from "@/types/User";
import { useUserPosts } from "@/lib/PostAPI";
import AppJobApplicationForm from "@/components/AppJobApplicationForm";

const Page = () => {
  const queryClient = useQueryClient();
  const [likePosts, setLikePosts] = useState<{ [key: number]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPostDialogOpen, setIsAddPostDialogOpen] = useState(false);
  const [isApplyJobPositionDialogOpen, setIsApplyJobPositionDialogOpen] = useState(false);
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading } = useUserPosts(undefined, searchQuery);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get<{ data: User }>("/api/me");
        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const toggleLike = (id: number) => {
    setLikePosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsDetailsDrawerOpen(true);
  };

  const handleEditPost = (post: Post, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPost(post);
    setIsEditPostDialogOpen(true);
  };

  const handleApplyJob = (post: Post, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPost(post);
    setIsApplyJobPositionDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col items-center p-5">
        <div className="flex w-full max-w-2xl items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              onChange={handleSearch}
              className="w-full pl-10 p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => setIsAddPostDialogOpen(true)}
            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary"
          >
            <Plus className="w-5 h-5" /> Add Post
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="w-10 h-10 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-5">
            {data && data.data?.map((post) => (
              <div
                key={post.id}
                className="relative w-full p-5 border rounded-lg shadow-lg bg-white hover:shadow-xl transition"
                onClick={() => handlePostClick(post)}
              >
                <span className="absolute top-2 left-2 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at as string), { addSuffix: true })}
                </span>

                <div className="absolute top-2 right-2 flex space-x-2">
                  {post.user?.id !== user?.id && (
                    <>
                      <button onClick={() => toggleLike(post.id!)}>
                        <Heart
                          className={`w-5 h-5 ${likePosts[post.id!]
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                            }`}
                        />
                      </button>
                      <button>
                        <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                      </button>
                    </>
                  )}

                  {post.user?.id === user?.id && (
                    <button
                      onClick={(event) => handleEditPost(post, event)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Pen className="w-5 h-5 text-gray-400 hover:text-primary" />
                    </button>
                  )}
                </div>

                <h2 className="text-lg font-semibold mt-6">{post.title}</h2>
                <p
                  className="text-gray-600 text-sm mt-2"
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {post?.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {post?.applicants && post.applicants.length > 0
                      ? `${post?.applicants?.length} Applied`
                      : "No Applicants"}
                  </span>

                  {post.user?.id !== user?.id && (
                    <>
                      {post.applicants?.some((applicant) => applicant.user_id === user?.id) ? (
                        <button
                          className="bg-green-500 text-white text-sm py-1 px-3 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white text-sm py-1 px-3 rounded-lg hover:bg-blue-600"
                          onClick={(event) => handleApplyJob(post, event)}
                        >
                          Apply Now
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppPostForm
        onClose={() => setIsAddPostDialogOpen(false)}
        isOpen={isAddPostDialogOpen}
        queryClient={queryClient}
      />

      {isEditPostDialogOpen && selectedPost && (
        <AppPostForm
          data={selectedPost}
          isOpen={isEditPostDialogOpen}
          onClose={() => setIsEditPostDialogOpen(false)}
          queryClient={queryClient}
        />
      )}

      {selectedPost && (
        <AppPostDetailsDrawer
          data={selectedPost}
          isOpen={isDetailsDrawerOpen}
          onClose={() => setIsDetailsDrawerOpen(false)}
        />
      )}

      {isApplyJobPositionDialogOpen && selectedPost && (
        <AppJobApplicationForm
          post={selectedPost}
          onClose={() => setIsApplyJobPositionDialogOpen(false)}
          isOpen={isApplyJobPositionDialogOpen}
          queryClient={queryClient}
        />
      )}
    </>
  );
};

export default Page;
