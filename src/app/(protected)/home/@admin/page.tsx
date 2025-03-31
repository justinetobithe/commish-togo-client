"use client";

import React, { useState } from "react";
import { Heart, X } from "lucide-react";

const jobPosts = [
    {
        id: 1,
        title: "Web Developer Needed",
        content:
            "We are looking for a web developer to build a responsive website using React and Node.js.",
        appliedCount: 25,
        postedTime: "1 min ago",
    },
    {
        id: 2,
        title: "Graphic Designer for Logo",
        content:
            "We need a creative graphic designer to design a logo for our startup. Modern & minimalist.",
        appliedCount: 10,
        postedTime: "2 hours ago",
    },
    {
        id: 3,
        title: "Content Writer for Blog",
        content:
            "Looking for a skilled content writer to write articles about technology trends.",
        appliedCount: 15,
        postedTime: "5 hours ago",
    },
    {
        id: 4,
        title: "Mobile App Developer",
        content:
            "Looking for an experienced mobile app developer to create an Android and iOS app.",
        appliedCount: 30,
        postedTime: "1 day ago",
    },
];

const Page = () => {
    const [likedJobs, setLikedJobs] = useState<{ [key: number]: boolean }>({});

    const toggleLike = (id: number) => {
        setLikedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    

    return (
        <div className="flex justify-center p-5">
            <div className="w-full max-w-2xl space-y-5">
                {jobPosts.map((job) => (
                    <div
                        key={job.id}
                        className="relative w-100 p-5 border rounded-lg shadow-lg bg-white hover:shadow-xl transition"
                    >
                        <span className="absolute top-2 left-2 text-xs text-gray-500">
                            {job.postedTime}
                        </span>

                        <div className="absolute top-2 right-2 flex space-x-2">
                            <button onClick={() => toggleLike(job.id)}>
                                <Heart
                                    className={`w-5 h-5 ${likedJobs[job.id] ? "text-red-500 fill-red-500" : "text-gray-400"
                                        }`}
                                />
                            </button>
                            <button>
                                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold mt-6">{job.title}</h2>
                        <p className="text-gray-600 text-sm mt-2">{job.content}</p>

                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">{job.appliedCount} Applied</span>
                            <button className="bg-blue-500 text-white text-sm py-1 px-3 rounded-lg hover:bg-blue-600">
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
