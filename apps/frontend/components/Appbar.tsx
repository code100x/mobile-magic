import { Button } from "./ui/button";
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'

export function Appbar() {
  return (
    <div className="flex justify-between px-18  items-center z-50 max-md:px-8 max-sm:px-2 ">
      <div className="text-3xl px-1 italic font-bold  bg-gradient-to-r from-red-500 to-indigo-600 text-transparent bg-clip-text ">Bolty</div>
      <div className="flex gap-4">
        <SignedOut>
           <Button  variant={"secondary"} className="cursor-pointer hover:bg-indigo-600 text-white bg-zinc-400/20 border">
           <SignInButton  />
           </Button>
           <Button variant={"default"} className="cursor-pointer">
           <SignUpButton />
           </Button>
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
