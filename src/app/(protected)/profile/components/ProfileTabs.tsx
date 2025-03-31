"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import User from "@/types/User";
import AppProfileForm from "./AppProfileForm";
import AppUserForm from "./AppUserForn";
import AppResumeUploadForm from "./AppResumeUploadForm";
import AppWorkExperienceForm from "./AppWorkExperienceForm";
import AppEducationalAttainmentForm from "./AppEducationalAttainmentForm";

interface ProfileTabsProps {
    user: User;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<string>("user");

    return (
        <div className="w-full mx-auto">
            <div className="mt-5">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="profile">Profile Details</TabsTrigger>
                        <TabsTrigger value="education">Educational Attainment</TabsTrigger>
                        <TabsTrigger value="experience">Work Experience</TabsTrigger>
                        <TabsTrigger value="resume">Resume Upload</TabsTrigger>
                        <TabsTrigger value="user">User Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="user">
                        <AppUserForm user={user} />
                    </TabsContent>

                    <TabsContent value="profile">
                        <AppProfileForm user={user} />
                    </TabsContent>

                    <TabsContent value="experience">
                        <AppWorkExperienceForm user={user} />
                    </TabsContent>

                    <TabsContent value="resume">
                        <AppResumeUploadForm user={user} />
                    </TabsContent>

                    <TabsContent value="education">
                        <AppEducationalAttainmentForm user={user} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfileTabs;
