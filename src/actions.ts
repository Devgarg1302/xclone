"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { imagekit } from "./utils";

export const followUser = async (targetUserId: string) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    await prisma.follow.create({
      data: { followerId: userId, followingId: targetUserId },
    });
  }
};
export const likePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: { userId, postId },
    });
  }
};
export const rePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingRePost = await prisma.post.findFirst({
    where: {
      userId: userId,
      rePostId: postId,
    },
  });

  if (existingRePost) {
    await prisma.post.delete({
      where: { id: existingRePost.id },
    });
  } else {
    await prisma.post.create({
      data: { userId, rePostId: postId },
    });
  }
};

export const savePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) return;

  const existingSavedPost = await prisma.savedPosts.findFirst({
    where: {
      userId: userId,
      postId: postId,
    },
  });

  if (existingSavedPost) {
    await prisma.savedPosts.delete({
      where: { id: existingSavedPost.id },
    });
  } else {
    await prisma.savedPosts.create({
      data: { userId, postId },
    });
  }
};

export const addComment = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const { userId } = await auth();

  if (!userId) return { success: false, error: true };

  const postId = formData.get("postId");
  const username = formData.get("username");
  const desc = formData.get("desc");

  const Comment = z.object({
    parentPostId: z.number(),
    desc: z.string().max(140),
  });

  const validatedFields = Comment.safeParse({
    parentPostId: Number(postId),
    desc,
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId,
      },
    });
    revalidatePath(`/${username}/status/${postId}`);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const addPost = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const { userId } = await auth();

  if (!userId) return { success: false, error: true };

  const desc = formData.get("desc");
  const file = formData.get("file") as File;
  const isSensitive = formData.get("isSensitive") as string;
  const imgType = formData.get("imgType");

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const transformation = `w-600,${imgType === "square" ? "ar-1-1" : imgType === "wide" ? "ar-16-9" : ""
      }`;

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer,
          fileName: file.name,
          folder: "/posts",
          ...(file.type.includes("image") && {
            transformation: {
              pre: transformation,
            },
          }),
        },
        function (error, result) {
          if (error) reject(error);
          else resolve(result as UploadResponse);
        }
      );
    });
  };

  const Post = z.object({
    desc: z.string().max(140),
    isSensitive: z.boolean().optional(),
  });

  const validatedFields = Post.safeParse({
    desc,
    isSensitive: JSON.parse(isSensitive),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  let img = "";
  let imgHeight = 0;
  let video = "";

  if (file.size) {
    const result: UploadResponse = await uploadFile(file);

    if (result.fileType === "image") {
      img = result.filePath;
      imgHeight = result.height;
    } else {
      video = result.filePath;
    }
  }

  console.log({
    ...validatedFields.data,
    userId,
    img,
    imgHeight,
    video,
  });

  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId,
        img,
        imgHeight,
        video,
      },
    });
    revalidatePath(`/`);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
  return { success: false, error: true };
};

export const updateUserProfile = async (formData: FormData) => {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    throw new Error("Not authenticated");
  }

  console.log(formData)

  try {
    // Extract text data
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;

    // Extract files
    const avatar = formData.get('avatar') as File;
    const cover = formData.get('cover') as File;

    // Upload images if provided
    let imgPath = undefined;
    let coverPath = undefined;

    if (avatar && avatar.size > 0) {
      // Upload to ImageKit for our database
      const avatarResult = await uploadToImageKit(avatar, '/profiles');
      imgPath = avatarResult.filePath;

      // Get the full URL for Clerk
      // clerkAvatarUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL}${avatarResult.filePath}`;

      // Update Clerk user avatar
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserProfileImage(userId, { file: avatar });
      } catch (clerkError) {
        console.error("Failed to update Clerk avatar:", clerkError);
        // Continue with the rest of the updates even if Clerk update fails
      }
    }

    if (cover && cover.size > 0) {
      const coverResult = await uploadToImageKit(cover, '/covers');
      coverPath = coverResult.filePath;
    }

    // Update Clerk user data (firstName used as displayName)
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUser(userId, {
        firstName: displayName || undefined,
      });
    } catch (clerkError) {
      console.error("Failed to update Clerk user data:", clerkError);
      // Continue with the database update even if Clerk update fails
    }

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        bio,
        location,
        website,
        ...(imgPath && { img: imgPath }),
        ...(coverPath && { cover: coverPath }),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

// Helper function to upload files to ImageKit
const uploadToImageKit = async (file: File, folder: string): Promise<UploadResponse> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: buffer,
        fileName: file.name,
        folder,
      },
      function (error, result) {
        if (error) reject(error);
        else resolve(result as UploadResponse);
      }
    );
  });
};