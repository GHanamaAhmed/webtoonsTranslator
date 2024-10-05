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
      <DialogContent className="w-11/12 p-0 bg-transparent border-0">
        <Siginin className="bg-transparent z-0 bg-LightBackground" />
      </DialogContent>
    </Dialog>
  );
}
