import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AppContactForm from '@/components/AppContactForm';
import { Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

// Assets
import Logo from '@public/img/logo.png';
import Banner from '@public/img/va.png';
import Feature1 from '@public/img/secure-login.png';
import Feature2 from '@public/img/collaboration.png';
import Feature3 from '@public/img/development.png';
import Objectives from '@public/img/objectives.png';

const Page = () => {
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white py-4 shadow-sm">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={Logo} alt="Commish ToGo Logo" quality={100} width={48} height={48} />
            <span className="ml-4 text-2xl font-bold">Commish ToGo</span>
          </Link>
          <Button variant="default" className="rounded-lg" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Banner Section */}
        <section className="container text-center py-16">
          <Image
            src={Banner}
            width={559}
            height={537}
            alt="Commish ToGo Banner"
            className="mx-auto mb-10"
          />
          <h1 className="text-4xl font-bold leading-10 mb-7">
            Empowering Students Through Seamless Academic Commissions
          </h1>
          <p className="text-md font-medium leading-7 mb-10">
            Welcome to Commish ToGo, a dedicated platform connecting students with academic commission opportunities. Enhance your skills, collaborate with peers, and earn while you learn.
          </p>
          <Button asChild>
            <Link href="/login">Join Now</Link>
          </Button>
        </section>

        <section className="container py-16">
          <h2 className="text-4xl font-bold text-center mb-7">Objectives</h2>
          <p className="text-md font-medium text-center leading-7 mb-10">
            Commish ToGo aims to streamline academic commission services through a secure and efficient online platform. Our mission is to foster skill enhancement, encourage peer collaboration, and create earning opportunities for students.
          </p>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
              <Image
                src={Objectives}
                alt="Objectives Illustration"
                width={500}
                height={500}
              />
            </div>
            <div className="md:w-1/2">
              <ul className="list-disc list-inside text-md font-medium leading-7">
                <li>Develop an efficient online website connecting students with commission opportunities.</li>
                <li>Serve diverse student clients across various educational levels.</li>
                <li>Ensure secure transactions, effective communication, and a user-friendly experience.</li>
                <li>Promote skill development and collaboration among students.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <h3 className="text-3xl font-bold mb-10 text-center">
            Why Choose Commish ToGo?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[Feature1, Feature2, Feature3].map((feature, index) => (
              <div key={index} className="rounded-lg bg-gray-100 p-6">
                <div className="relative h-40 mb-4">
                  <Image src={feature} alt={`Feature ${index + 1}`} fill objectFit="cover" />
                </div>
                <h5 className="text-sm text-blue-500 mb-2">Feature #{index + 1}</h5>
                <h4 className="text-lg font-medium mb-4">
                  {["Secure Transactions", "Peer Collaboration", "Skill Development"][index]}
                </h4>
                <p>
                  {[
                    "Experience safe and reliable transactions with our platform, ensuring peace of mind for both clients and freelancers.",
                    "Collaborate with fellow students on various academic projects, fostering a community of shared knowledge and support.",
                    "Enhance your academic skills by engaging in diverse projects, building a portfolio that stands out."
                  ][index]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="container text-center py-16">
          <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
          <p className="text-md leading-7 mb-16">
            Have questions or need assistance? Reach out to us, and our team will be happy to help you navigate your academic journey with Commish ToGo.
          </p>
          <AppContactForm />
          <div className="mt-10 border-t pt-6">
            <ul className="space-y-4">
              <li>
                <Link href="mailto:commishtogo@gmail.com" className="font-medium text-primary-600">
                  commishtogo@gmail.com
                </Link>
              </li>
              <li>
                <span className="font-medium text-gray-600">Gen. Douglas MacArthur Hwy, Talomo, Davao City, 8000 Davao del Sur</span>
              </li>
              <li>
                <ul className="inline-flex space-x-4 text-gray-500">
                  {[Facebook, Twitter, Instagram, MessageCircle].map((Icon, idx) => (
                    <li key={idx} className="inline-block">
                      <Link href="/" target="_blank">
                        <Icon />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center bg-gray-50">
        <div className="flex justify-center items-center">
          <Image src={Logo} alt="Commish ToGo Logo" width={32} height={32} />
          <span className="ml-2 text-sm text-gray-500">
            © {new Date().getFullYear()} Commish ToGo
          </span>
        </div>
      </footer>
    </>
  );
};

export default Page;
