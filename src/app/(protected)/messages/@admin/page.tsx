"use client"
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppInbox from '@/components/AppInbox';


const Page = () => {
    const queryClient = useQueryClient();

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[2rem] font-bold">Message</h1>
            </div>
            {/* <AppInbox /> */}
        </>
    );
};

export default Page;
