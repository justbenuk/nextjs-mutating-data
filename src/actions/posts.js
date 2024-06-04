'use server'
import { storePost, updatePostLikeStatus } from "@/lib/posts";
import { redirect } from "next/navigation";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
export async function createPost(prevState, formData) {
  const title = formData.get('title');
  const image = formData.get('image');
  const content = formData.get('content');

  let errors = []

  //check form as been completed
  if (!title || title.trim().length === 0) {
    errors.push("Title is required")
  }
  if (!content || content.trim().length === 0) {
    errors.push("Content is required")
  }
  if (!image || image.size === 0) {
    errors.push("An Image is required")
  }

  if (errors.length > 0) {
    return { errors }
  }

  let imageUrl

  // upload the image to cloudinery
  try {
    imageUrl = await uploadImage(image)
  } catch (error) {
    throw new Error('Image upload failed, Please try again later')
  }

  await storePost({
    imageUrl,
    title,
    content,
    userId: 1
  })
  redirect('/feed')
}

export async function togglePostLikeStatus(postId){
  await updatePostLikeStatus(postId, 2)
  revalidatePath('/feed')
}
