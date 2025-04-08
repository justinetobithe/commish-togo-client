'use client';
import React from 'react';
import AppRoutes from './AppRoutes';
import User from '@/types/User';
import { useSession } from 'next-auth/react';
import useStore from '@/store/useStore';

const AppSidebar = () => {
  const session = useSession();
  const { isSidebarOpen } = useStore((state) => state.app);

  return (
    <aside
      className={`top-[4.4rem] z-50 h-[calc(100vh-theme(spacing.20))] overflow-y-auto bg-white transition-transform sm:sticky ${isSidebarOpen
          ? 'fixed translate-x-0 w-[280px]'
          : 'fixed -translate-x-full w-0'
        }`}
    >
      <nav className='relative z-50 border-t border-[#E5E7EB] bg-white px-5 pb-5 pt-5'>
        {session?.data?.user && (
          <AppRoutes user={session.data.user as unknown as Omit<User, 'dob'>} />
        )}
      </nav>
    </aside>
  );
};

export default AppSidebar;
