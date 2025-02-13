'use client';
import React, { useState } from 'react';
import {
    ColumnDef,
    PaginationState,
    SortingState,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';
import AppTable from '@/components/AppTable';
import { ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Strand } from '@/types/Strand';
import { useDeleteStrand, useUpdateStrand, useStrands } from '@/lib/StrandAPI';
import AppConfirmationDialog from './AppConfirmationDialog';
import { toast } from '@/components/ui/use-toast';
import AppStrandForm from './AppStrandForm';
import { useQueryClient } from '@tanstack/react-query';

export default function AppStrandsTable() {
    const queryClient = useQueryClient();
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);

    const { data, isLoading } = useStrands(
        pageIndex + 1,
        pageSize,
        searchKeyword,
        sorting.map((item) => item.id).join(','),
        Boolean(sorting.map((item) => item.desc).join(','))
    );

    const { mutate } = useDeleteStrand();
    const { mutate: updateStrand } = useUpdateStrand();

    const handleEditStrand = (strand: Strand) => {
        setSelectedStrand(strand);
        setIsEditDialogOpen(true);
    };

    const handleDeleteStrand = (id: number) => {
        mutate(id, {
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['strands'] });
            }
        });
    };

    const columns: ColumnDef<Strand>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='pl-0 text-left hover:!bg-transparent'
                    onClick={() => column.toggleSorting()}
                >
                    Strand
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            ),
            cell: ({ row }) => row.original.name,
            enableSorting: true,
        },
        {
            accessorKey: 'acronym',
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='pl-0 text-left hover:!bg-transparent'
                    onClick={() => column.toggleSorting()}
                >
                    Acronym
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            ),
            cell: ({ row }) => row.original.acronym,
            enableSorting: true,
        },
        {
            id: 'actions',
            header: () => <div className='text-center'>Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-center items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type='button'
                                    variant="outline"
                                    className="mr-2"
                                    onClick={() => handleEditStrand(row.original)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <AppConfirmationDialog
                        title='Delete Strand'
                        description={`Are you sure you want to delete the strand "${row.original.name}"? This action cannot be undone.`}
                        buttonElem={
                            <Button className="text-white" variant="destructive" type='button'>
                                <Trash size={20} />
                            </Button>
                        }
                        handleDialogAction={() => handleDeleteStrand(row.original.id!)}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        }
    ];

    const pagination = React.useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    const table = useReactTable({
        data: data?.data ?? Array(10).fill({}),
        columns: isLoading
            ? columns.map((column) => ({ ...column, cell: () => <Skeleton className='h-12 w-full' /> }))
            : columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        onGlobalFilterChange: setSearchKeyword,
        pageCount: data?.last_page ?? -1,
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        state: {
            sorting,
            pagination,
            globalFilter: searchKeyword,
        },
    });

    return (
        <div>
            <AppTable table={table} />
            {selectedStrand && (
                <AppStrandForm
                    data={selectedStrand}
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    queryClient={queryClient}
                />
            )}
        </div>
    );
}
