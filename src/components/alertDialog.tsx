"use client";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React, { createContext } from "react";
type DialogProps = {
  children: React.ReactNode;
};
type HandleDialogProps = {
  message?: string;
  title?: string;
  onOK?: () => void;
  onCancel?: () => void;
};
export const DialogContext = createContext<{
  open: ({ message }: HandleDialogProps) => void;
}>({
  open({}) {},
});

export function AlertDialogProvider({ children }: DialogProps) {
  const [message, setMessage] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [onOk, setOnOk] = React.useState<(() => void) | undefined>(() => null);
  const [onClose, setOnClose] = React.useState<(() => void) | undefined>(
    () => null
  );
  const handleChange = (value: boolean) => {
    setOpen(value);
  };
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };
  const handleOk = () => {
    setOpen(false);
    onOk?.();
  };
  const handleNotification = ({
    message,
    title,
    onCancel,
    onOK,
  }: HandleDialogProps) => {
    setMessage(message || "");
    setTitle(title || "");
    setOnOk(() => onOK);
    setOnClose(() => onCancel);
    setOpen(true);
  };
  return (
    <>
      {" "}
      <AlertDialog open={open} onOpenChange={handleChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOk} autoFocus>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DialogContext.Provider value={{ open: handleNotification }}>
        {children}
      </DialogContext.Provider>
    </>
  );
}
