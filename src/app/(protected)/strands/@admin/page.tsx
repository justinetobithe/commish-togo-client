"use client"
import React, { useState } from 'react';
import AppStrandsTable from '@/components/AppStrandsTable';
import { Button } from '@/components/ui/button';
import { Plus } from "lucide-react";
import AppStrandForm from '@/components/AppStrandForm';
import { useQueryClient } from '@tanstack/react-query';


const Page = () => {
  const queryClient = useQueryClient();
  const [isAddStrandDialogOpen, setIsAddStrandDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[2rem] font-bold">Strands</h1>
        <Button className="ml-auto" onClick={() => { setIsAddStrandDialogOpen(true) }}>
          <Plus className="mr-2" />Add Strand
        </Button>
      </div>
      <AppStrandsTable />
      {
        isAddStrandDialogOpen && (
          <AppStrandForm
            onClose={() => setIsAddStrandDialogOpen(false)}
            isOpen={isAddStrandDialogOpen}
            queryClient={queryClient}
          />
        )
      }
    </>
  );
};

export default Page;
