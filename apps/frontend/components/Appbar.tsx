import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";

export function Appbar() {
  return (
    <div className="flex justify-between px-2 py-1 ">
      <div className="font-bold cursor-pointer text-2xl italic text-white hover:text-neutral-300 transition-colors duration-300 z-40">
        Bolty
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <div className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg shadow-md text-white text-sm font-medium transition-all duration-300 hover:shadow-lg cursor-pointer">
            <SignInButton />
          </div>
          <div className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md text-white text-sm font-medium transition-all duration-300 hover:shadow-lg cursor-pointer">
            <SignUpButton />
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
