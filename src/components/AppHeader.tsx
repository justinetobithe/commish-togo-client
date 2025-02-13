import React, { FC } from 'react';
import { getServerSession } from 'next-auth';
import AuthOptions from '@/lib/AuthOptions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';
import AppNavBurger from './AppNavBurger';
import Logo from '@public/img/logo.png';

const AppHeader: FC = async () => {
  const session = await getServerSession(AuthOptions);

  return (
    <ul className='flex items-center justify-between bg-white px-5 py-3 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)]'>
      <li className='flex items-center'>
        <AppNavBurger />
        <Link href='/home' className='flex items-center space-x-2'>
          <Image src={Logo} width={48} height={48} alt='Logo' />
          <span className='text-[1.25rem] font-bold'>Commish Togo</span>
        </Link>
      </li>

      <li className='flex-grow flex justify-center'>
        <div className='relative w-1/3'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5' />
          <input
            type='text'
            placeholder='Search...'
            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
        </div>
      </li>

      <li className='ml-auto inline-block'>
        <div className='flex items-center space-x-3'>
          <button
            aria-label='Notifications'
            className='p-2 rounded-full hover:bg-gray-200 transition'
          >
            <Bell className='w-5 h-5 text-gray-600' />
          </button>

          <span className='hidden text-[0.8rem] font-bold sm:inline'>
            {session?.user.name}
          </span>

          <Avatar>
            <AvatarImage
              src={session?.user.image ?? undefined}
              alt='@shadcn'
              className='object-cover'
            />
            <AvatarFallback>
              {session?.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </li>
    </ul>
  );
};

export default AppHeader;
