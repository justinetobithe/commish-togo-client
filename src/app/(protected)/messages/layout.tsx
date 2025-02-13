import AuthOptions from '@/lib/AuthOptions';
import { getServerSession } from 'next-auth';
import React, { FC } from 'react';

const Layout: FC<{
    admin: React.ReactNode;
    user: React.ReactNode;
}> = async ({ admin, user }) => {
    const session = await getServerSession(AuthOptions);

    console.log("user.role", session?.user.role)

    const renderContent = () => {
        switch (session?.user.role) {
            case 'admin':
                return admin;
            case 'user':
                return user;
            default:
                return null;
        }
    };

    return <>{renderContent()}</>;
};

export default Layout;
