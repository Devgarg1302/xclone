"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import Image from "./Image";
import { updateUserProfile } from "@/actions";
import NextImage from "next/image";

type UpdateProfileProps = {
  onClose: () => void;
  currentUser: {
    displayName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    img: string | null;
    cover: string | null;
  };
};

const UpdateProfile = ({ onClose, currentUser }: UpdateProfileProps) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName || "",
    bio: currentUser.bio || "",
    location: currentUser.location || "",
    website: currentUser.website || "",
  });

  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const avatarPreviewURL = avatar ? URL.createObjectURL(avatar) : null;
  const coverPreviewURL = coverImage ? URL.createObjectURL(coverImage) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSubmit = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });

      console.log("Dev:" + JSON.stringify(avatar))
      // Add image files if they exist
      if (avatar) {
        formDataToSubmit.append('avatar', avatar);
      }

      if (coverImage) {
        formDataToSubmit.append('cover', coverImage);
      }

      console.log(formDataToSubmit)
      await updateUserProfile(formDataToSubmit);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-borderGray rounded-xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2">
              <Image path="icons/close.svg" alt="Close" w={20} h={20} />
            </button>
            <h2 className="text-xl font-bold">Edit profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-black font-bold px-4 py-1 rounded-full disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        <form className="flex flex-col gap-4">
          {/* Cover Image */}
          <div className="relative">
            <div className="aspect-[3/1] w-full rounded-md overflow-hidden bg-gray-800">
              {coverPreviewURL ? (
                <NextImage
                  src={coverPreviewURL}
                  alt="Cover Preview"
                  width={600}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  path={currentUser.cover || "general/noCover.jpeg"}
                  alt=""
                  w={600}
                  h={200}
                  tr={true}
                />
              )}
              <div
                className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-2 cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Avatar */}
          <div className="relative mx-auto -mt-10 z-10">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-gray-800">
              {avatarPreviewURL ? (
                <NextImage
                  src={avatarPreviewURL}
                  alt="Avatar Preview"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  path={currentUser.img || "general/noAvatar.jpg"}
                  alt=""
                  w={100}
                  h={100}
                  tr={true}
                />
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white rounded-full p-2 cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-textGray mb-1">Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="bg-transparent border border-borderGray rounded-md p-2"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-textGray mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bg-transparent border border-borderGray rounded-md p-2 resize-none"
              rows={3}
              maxLength={160}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-textGray mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-transparent border border-borderGray rounded-md p-2"
              maxLength={30}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-textGray mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
              className="bg-transparent border border-borderGray rounded-md p-2"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile; 