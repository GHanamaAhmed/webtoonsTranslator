"use client";
import { Siginin } from "@/components/auth/siginin";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function DialogDemo() {
  const router = useRouter();
  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={(value) => {
        if (!value) {
          router.back();
        }
      }}
      
    >
      <DialogContent className="mx-auto max-w-sm p-0">
        <Siginin className="w-full h-full bg-transparent z-0" />
      </DialogContent>
    </Dialog>
  );
}
