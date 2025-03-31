"use client";
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AppInbox from "@/components/AppInbox";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

const Page = () => {
    const queryClient = useQueryClient();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        async function fetchSession() {
            const userSession = (await getSession()) as Session | null;
            setSession(userSession);
        }
        fetchSession();
    }, []);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[2rem] font-bold">Message</h1>
            </div>
            <AppInbox />
        </>
    );
};

export default Page;
