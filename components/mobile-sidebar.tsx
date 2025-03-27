import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../@/components/ui/sheet";
import NavBar from "./navbar";
import { Menu } from "lucide-react";

const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="w-8 h-8" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <Image
              src="/public/images/afriki.png"
              width="300"
              height="200"
              alt="Afrikipresse"
            />
          </SheetTitle>

          <NavBar />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
