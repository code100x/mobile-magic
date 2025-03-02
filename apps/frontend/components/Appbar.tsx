import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Appbar() {
  return (
    <div className="flex justify-between items-center px-4 py-4 border">
      <div className='text-2xl font-bold uppercase'>Bolty</div>
      <div>
        <SignedOut>
          <span className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 px-4 py-1.5 rounded-lg font-semibold mr-2">
            <SignInButton />
          </span>
          <span className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 px-4 py-1.5 rounded-lg font-semibold">
            <SignUpButton />
          </span>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
