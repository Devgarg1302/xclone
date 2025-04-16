"use client";

import { useState } from "react";
import UpdateProfile from "./UpdateProfile";

type EditProfileButtonProps = {
  user: {
    displayName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    img: string | null;
    cover: string | null;
  };
};

const EditProfileButton = ({ user }: EditProfileButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="py-1 px-4 rounded-full border-[1px] border-gray-500 font-bold hover:bg-[#181818] transition-colors"
      >
        Edit profile
      </button>
      
      {isModalOpen && (
        <UpdateProfile 
          onClose={() => setIsModalOpen(false)} 
          currentUser={user} 
        />
      )}
    </>
  );
};

export default EditProfileButton; 