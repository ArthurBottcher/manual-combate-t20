import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Verifique se o caminho para seus componentes shadcn/ui está correto
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Apagar",
  cancelText = "Cancelar",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 pt-2">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:justify-start">
          <AlertDialogAction className='bg-destructive text-white hover:bg-destructive/90' onClick={onConfirm}>{confirmText}</AlertDialogAction>
          <AlertDialogCancel  className='text-black bg-neutral-100 hover:bg-neutral-200' onClick={onClose}>{cancelText}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;