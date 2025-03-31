"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import AppNavBurger from "./AppNavBurger";
import { Bell, ChevronDown } from "lucide-react";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import Logo from '@public/img/logo.png';
import { useLogout } from "@/lib/AuthenticationAPI";
import { useRouter } from 'next/navigation';
import AppNotificationsDropdown from "./AppNotificationsDropdown";
import { Service } from "@/types/Service";
import { api } from "@/lib/api";


const notifications = [
  { id: 1, message: "John Doe commented on your post", timestamp: new Date().toISOString() },
  { id: 2, message: "Jane Smith reacted to your post", timestamp: new Date().toISOString() },
  { id: 3, message: "Mike Johnson followed you", timestamp: new Date().toISOString() },
];

const AppHeader = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const logout = useLogout();

  const [services, setServices] = useState<Service[]>([]);


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get<{ data: Service[] }>('/api/services');
        setServices(response.data.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchSession() {
      const userSession = await getSession();
      setSession(userSession as Session | null);
    }
    fetchSession();
  }, []);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const toggleServicesDropdown = () => setServicesDropdownOpen(prev => !prev);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/login");
  };

  return (
    <ul className='flex items-center justify-between bg-white px-5 py-3 shadow-md'>
      <li className='flex items-center'>
        <AppNavBurger />
        <div className='flex items-center space-x-10'>
          <Link href='/home' className='flex items-center space-x-2'>
            <Image src={Logo} width={48} height={48} alt='Logo' />
            <span className='text-[1.25rem] font-bold'>Commish Togo</span>
          </Link>
        </div>

      </li>

      <li className='ml-[300px] inline-block relative'>
        <button
          className="flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-md"
          onClick={toggleServicesDropdown}
        >
          Services <ChevronDown className="ml-2 w-4 h-4" />
        </button>
        {servicesDropdownOpen && (
          <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md w-[900px] py-4 z-[9999] border">
            {services.length > 0 ? (
              <div className="grid grid-cols-5 gap-3 px-4">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="text-gray-700 hover:bg-gray-100 text-sm font-medium p-2 text-left rounded-md flex justify-start items-start"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-3 text-gray-500">No services available</div>
            )}
          </div>
        )}
      </li>

      <li className='ml-auto inline-block'>
        <div className='flex items-center space-x-3'>

          <AppNotificationsDropdown notifications={notifications} />

          <span className='hidden text-[0.8rem] font-bold sm:inline'>
            {session?.user.name}
          </span>

          <div className='relative'>
            <Avatar onClick={toggleDropdown} className='cursor-pointer'>
              <AvatarImage
                src={session?.user.image ?? undefined}
                alt='@shadcn'
                className='object-cover'
              />
              <AvatarFallback>
                {session?.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {dropdownOpen && (
              <div className='absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 py-2 border'>
                <Link
                  href='/profile'
                  className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className='!w-full block px-4 py-2 text-gray-700 hover:bg-gray-100 text-left'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </li>
    </ul>
  );
};

export default AppHeader;
