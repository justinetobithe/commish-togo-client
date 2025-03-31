"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { MessageCircle, MoreVertical } from "lucide-react";
import { useGetAllProfiles } from "@/lib/ProfileAPI";

const Page = () => {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<Session | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const { data: profiles, isLoading, isError } = useGetAllProfiles();

    console.log("profiles ", profiles?.data)

    useEffect(() => {
        async function fetchSession() {
            const userSession = await getSession();
            setSession(userSession);
        }
        fetchSession();
    }, []);

    if (isLoading) {
        return <div className="p-5">Loading...</div>;
    }

    if (isError) {
        return <div className="p-5 text-red-500">Failed to load profiles.</div>;
    }

    // `${process.env.NEXT_PUBLIC_API_URL || ''}/storage/image/${profile?.image}`

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[2rem] font-bold">Discover Freelancers</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(profiles?.data) && profiles?.data.map((profile) => (
                    <div
                        key={profile.id}
                        className="relative flex flex-col bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition border"
                    >

                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setDropdownOpen(dropdownOpen === profile.id ? null : profile.id)}
                                className="text-gray-500 hover:text-primary"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            {dropdownOpen === profile.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border z-10">
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Follow</button>
                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Block</button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {
                                profile?.image ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/image/${profile.image}`}
                                        alt={`${profile?.first_name} ${profile?.last_name}`}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-semibold">
                                        {`${profile?.first_name?.charAt(0)?.toUpperCase() || ""}${profile?.last_name?.charAt(0)?.toUpperCase() || ""}` || "N/A"}
                                    </div>
                                )
                            }
                            <div>
                                <h2 className="text-lg font-semibold">{`${profile.first_name} ${profile?.last_name}`}</h2>
                                <p className="text-gray-600 text-sm">{profile?.profile?.hourly_rate}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-700">Skills</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.profile
                                    ? profile?.profile?.skills.split(',').map((skill: string, index: number) => (
                                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                            {skill.trim()}
                                        </span>
                                    ))
                                    : <span className="text-gray-500">No skills listed</span>}
                            </div>

                        </div>

                        <p className="text-gray-600 text-sm mt-3">{profile?.profile?.brief_description || "No description available."}</p>

                        <div className="mt-4 flex justify-between items-center">
                            <button className="text-sm bg-primary text-white py-1 px-3 rounded-lg hover:bg-primary">
                                More Details
                            </button>
                            <button className="text-gray-500 hover:text-primary">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
