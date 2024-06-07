'use client'
import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { useOptimistic } from 'react'
import { togglePostLikeStatus } from '@/actions/posts';
import Image from 'next/image';

// cloudinary
function imageLoader(config){

  //build the cloudinary url
  const urlStart = config.src.split('upload/')[0]
  const urlEnd = config.src.split('upload/')[1]
  const transorm = `w_200,q_${config.quality}`

  //return the built url
  return `${urlStart}upload/${transorm}/${urlEnd}`
}
function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <Image loader={imageLoader} src={post.image} alt={post.title} width={200} height={120} quality={50}/>
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form action={action.bind(null, post.id)} className={post.isLiked ? 'liked' : ''}>
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {

  // we need to access the post array and midify the like status before the post is updated.
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostId) => {

    // find the index of the post we want to update
    const updatedPostIndex = prevPosts.findIndex(post => post.id === updatedPostId)

    // check if the post does exist
    if(updatedPostId === -1){
      return prevPosts
    }

    // access the like status of the current posts and pre render the change while to form is being actioned
    const updatedPost = {...prevPosts[updatedPostIndex]}

    // if post is being like we add 1 if its being unliked we take one away
    updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1)

    // we updated the likes to what ever the oiposite status is
    updatedPost.isLiked = !updatedPost.isLiked

    //Update the posts array with new data
    const newPosts = [...prevPosts]
    newPosts[updatedPostIndex] = updatedPost
    return newPosts
  })
  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId){
    updateOptimisticPosts(postId)
    await togglePostLikeStatus(postId)
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost}/>
        </li>
      ))}
    </ul>
  );
}
