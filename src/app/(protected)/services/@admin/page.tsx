"use client"
import React, { useState } from 'react';
import AppServicesTable from '@/components/AppServicesTable';
import { Button } from '@/components/ui/button';
import { Plus } from "lucide-react";
import AppServicesForm from '@/components/AppServicesForm';
import { useQueryClient } from '@tanstack/react-query';


const Page = () => {
  const queryClient = useQueryClient();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[2rem] font-bold">Services</h1>
        <Button className="ml-auto" onClick={() => { setIsAddServiceDialogOpen(true) }}>
          <Plus className="mr-2" />Add Service
        </Button>
      </div>
      <AppServicesTable />
      {
        isAddServiceDialogOpen && (
          <AppServicesForm
            onClose={() => setIsAddServiceDialogOpen(false)}
            isOpen={isAddServiceDialogOpen}
            queryClient={queryClient}
          />
        )
      }
    </>
  );
};

export default Page;
