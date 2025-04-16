"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import Image from "@/components/Image";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { addPost } from "@/actions";
import ImageEditor from "@/components/ImageEditor";

const PostModal = () => {
  const router = useRouter();
  const { user } = useUser();
  const [media, setMedia] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
    sensitive: boolean;
  }>({
    type: "original",
    sensitive: false,
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  const previewURL = media ? URL.createObjectURL(media) : null;

  const [state, formAction, isPending] = useActionState(addPost, {
    success: false,
    error: false,
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMedia(null);
      setSettings({ type: "original", sensitive: false });
      router.back(); // Close modal on successful post
    }
  }, [state, router]);

  const closeModal = () => {
    router.back();
  };

  // Get user's avatar from Clerk directly instead of fetching from DB
  const userAvatar = user?.imageUrl || 'general/noAvatar.jpg';
  const userName = user?.username || "User";

  return (
    <div className="absolute w-screen h-screen top-0 left-0 z-20 bg-[#293139a6] flex justify-center">
      <div className="py-4 px-8 rounded-xl bg-black w-[600px] h-max mt-12">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={closeModal}>
            X
          </div>
          <div className="text-iconBlue font-bold">Drafts</div>
        </div>
        {/* CENTER & BOTTOM */}
        <form
          ref={formRef}
          className="py-4 flex flex-col gap-4"
          action={formAction}
        >
          <input
            type="text"
            name="imgType"
            value={settings.type}
            hidden
            readOnly
          />
          <input
            type="text"
            name="isSensitive"
            value={settings.sensitive ? "true" : "false"}
            hidden
            readOnly
          />
          <div className="py-4 flex gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                path={userAvatar}
                alt={userName}
                w={100}
                h={100}
                tr={true}
              />
            </div>
            <input
              type="text"
              name="desc"
              className="flex-1 bg-transparent outline-none text-lg"
              placeholder="What is happening?!"
            />
          </div>
          
          {/* PREVIEW IMAGE */}
          {media?.type.includes("image") && previewURL && (
            <div className="relative rounded-xl overflow-hidden">
              <NextImage
                src={previewURL}
                alt=""
                width={600}
                height={600}
                className={`w-full ${
                  settings.type === "original"
                    ? "h-full object-contain"
                    : settings.type === "square"
                      ? "aspect-square object-cover"
                      : "aspect-video object-cover"
                }`}
              />
              <div
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer"
                onClick={() => setIsEditorOpen(true)}
              >
                Edit
              </div>
              <div
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
                onClick={() => setMedia(null)}
              >
                X
              </div>
            </div>
          )}
          {media?.type.includes("video") && previewURL && (
            <div className="relative">
              <video src={previewURL} controls className="w-full" />
              <div
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
                onClick={() => setMedia(null)}
              >
                X
              </div>
            </div>
          )}
          {isEditorOpen && previewURL && (
            <ImageEditor
              onClose={() => setIsEditorOpen(false)}
              previewURL={previewURL}
              settings={settings}
              setSettings={setSettings}
            />
          )}
          
          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-borderGray pt-4">
            <div className="flex gap-4 flex-wrap">
              <input
                type="file"
                name="file"
                onChange={handleMediaChange}
                className="hidden"
                id="file"
                accept="image/*,video/*"
              />
              <label htmlFor="file">
                <Image
                  path="icons/image.svg"
                  alt=""
                  w={20}
                  h={20}
                  className="cursor-pointer"
                />
              </label>
              <Image
                path="icons/gif.svg"
                alt=""
                w={20}
                h={20}
                className="cursor-pointer"
              />
              <Image
                path="icons/poll.svg"
                alt=""
                w={20}
                h={20}
                className="cursor-pointer"
              />
              <Image
                path="icons/emoji.svg"
                alt=""
                w={20}
                h={20}
                className="cursor-pointer"
              />
              <Image
                path="icons/schedule.svg"
                alt=""
                w={20}
                h={20}
                className="cursor-pointer"
              />
              <Image
                path="icons/location.svg"
                alt=""
                w={20}
                h={20}
                className="cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-5 text-black bg-white rounded-full font-bold disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
            >
              {isPending ? "Posting..." : "Post"}
            </button>
            {state.error && (
              <span className="text-red-300 p-4">Something went wrong!</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;