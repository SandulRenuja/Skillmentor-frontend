import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { NavLink } from "react-router";

export default function Navbar() {
  return (
    <nav className="bg-black text-white flex gap-2 p-4 justify-around">
      <div className="flex gap-2">
        <NavLink
          to="/"
          className={({ isActive }: { isActive: boolean }) => (isActive ? "text-amber-400" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }: { isActive: boolean }) => (isActive ? "text-amber-400" : "")}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/login"
          className={({ isActive }: { isActive: boolean }) => (isActive ? "text-amber-400" : "")}
        >
          Login
        </NavLink>

        <NavLink
          to="/sessions"
          className={({ isActive }: { isActive: boolean }) => (isActive ? "text-amber-400" : "")}
        >
          Session
        </NavLink>
      </div>

      <div className="flex gap-2">
        <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      {/* Show the user button when the user is signed in */}
      <SignedIn>
        <UserButton />
      </SignedIn>
      </div>
  </nav>
  );
} 