import React, { FC, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AppConfirmationDialog: FC<{
  title?: string;
  description?: string | React.ReactNode;
  buttonElem: ReactNode;
  cancelButton?: boolean;
  handleDialogAction?: () => void;
  
}> = ({
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  buttonElem,
  cancelButton = true,
  handleDialogAction,
}) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{buttonElem}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {cancelButton && <AlertDialogCancel>Cancel</AlertDialogCancel>}
            <AlertDialogAction onClick={handleDialogAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

export default AppConfirmationDialog;

