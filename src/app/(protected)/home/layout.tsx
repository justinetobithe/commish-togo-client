import AuthOptions from '@/lib/AuthOptions';
import { getServerSession } from 'next-auth';
import React, { ReactNode } from 'react';

const Layout = async ({ admin, user }: { admin: ReactNode; user: ReactNode }) => {
  const session = await getServerSession(AuthOptions);

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
