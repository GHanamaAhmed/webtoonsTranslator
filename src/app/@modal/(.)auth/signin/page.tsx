import { Siginin } from "@/components/auth/siginin";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
export default function DialogDemo() {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent className="sm:max-w-[425px]">
        <Siginin />
      </DialogContent>
    </Dialog>
  );
}
