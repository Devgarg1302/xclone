"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import Logout from "./Logout";

type UserProfileSectionProps = {
    imageUrl?: string | null;
    firstName?: string | null;
    username: string;
};

const UserProfileSection = ({ imageUrl, firstName, username }: UserProfileSectionProps) => {
    const [showLogout, setShowLogout] = useState(false);
    const { signOut } = useClerk();
    const logoutRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close logout panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                logoutRef.current &&
                profileRef.current &&
                !logoutRef.current.contains(event.target as Node) &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setShowLogout(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
                <div
                    ref={profileRef}
                    className="w-10 h-10 relative rounded-full overflow-hidden cursor-pointer"
                    onClick={() => setShowLogout(!showLogout)}
                >
                    <img src={imageUrl || "/general/noAvatar.jpeg"} alt={username || ''} width={100} height={100} />
                </div>
                <div className="hidden xxl:flex flex-col">
                    <span className="font-bold">{firstName || username}</span>
                    <span className="text-sm text-textGray">@{username}</span>
                </div>
            </div>

            <Logout username={username || ''} />

            {showLogout && (
                <div
                    ref={logoutRef}
                    className=" bg-white py-6 px-8 rounded-xl absolute left-4 bottom-4 flex flex-col gap-2 w-max"
                >
                    <Link
                        href={username}
                        className="text-textGray text-sm"
                        onClick={() => setShowLogout(false)}
                    >
                        User Profile
                    </Link>
                    <Link
                        href="/profile"
                        className="text-textGray text-sm"
                        onClick={() => setShowLogout(false)}
                    >
                        Saved Posts
                    </Link>
                    <Link
                        href="/profile"
                        className="text-textGray text-sm"
                        onClick={() => setShowLogout(false)}
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

export default UserProfileSection; 