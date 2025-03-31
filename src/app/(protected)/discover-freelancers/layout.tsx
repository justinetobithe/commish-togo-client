import AuthOptions from '@/lib/AuthOptions';
import { getServerSession } from 'next-auth';
import React, { ReactNode } from 'react';

const Layout = async ({ user }: { user: ReactNode }) => {
    const session = await getServerSession(AuthOptions);

    const renderContent = () => {
        return session?.user.role === 'user' ? user : null;
    };

    return <>{renderContent()}</>;
};

export default Layout;
