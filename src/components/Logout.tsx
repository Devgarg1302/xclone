"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
// import Image from "./Image";

type User = {
  username: string;
}

const Logout = ({ username }: User) => {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hidden xxl:block relative">
      <div
        ref={buttonRef}
        className="cursor-pointer font-bold"
        onClick={() => setOpen((prev) => !prev)}
      >
        ...
      </div>
      {open && (
        <div 
          ref={menuRef}
          className=" bg-white py-6 px-8 rounded-xl absolute left-4 bottom-4 flex flex-col gap-2 w-max"
        >
          <Link
            href={username}
            className="text-textGray text-sm"
            onClick={() => setOpen(false)}
          >
            User Profile
          </Link>
          <Link
            href="/profile"
            className="text-textGray text-sm"
            onClick={() => setOpen(false)}
          >
            Saved Posts
          </Link>
          <Link
            href="/profile"
            className="text-textGray text-sm"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <hr />
          <button
            className="bg-black rounded-md px-2 py-1 "
            onClick={() => signOut()}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Logout;