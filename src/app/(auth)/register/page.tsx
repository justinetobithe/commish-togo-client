import React, { FC } from 'react';
import Image from 'next/image';
import Logo from '@public/img/logo.png';
import Freelancer from '@public/img/freelancer.png';
import { getServerSession } from 'next-auth';
import AuthOptions from '@/lib/AuthOptions';
import { redirect } from 'next/navigation';
import RegisterForm from './components/RegisterForm';

const Page: FC = async () => {
  const session = await getServerSession(AuthOptions);

  if (session) {
    redirect('/home');
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex justify-center items-center bg-white">
        <Image
          src={Freelancer}
          alt="Banner Image"
          width={700}
          height={700}
        />
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-full text-center mb-4">
          <Image
            src={Logo}
            alt="Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
        </div>
        <RegisterForm />
        <div className="mt-4 text-center">
          <p>
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
