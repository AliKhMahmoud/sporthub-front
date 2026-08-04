import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";

import ForumPostCard from "../features/forum/components/ForumPostCard";
import CreatePostForm from "../features/forum/components/CreatePostForm";

import { useAuth } from "../context/AuthContext";

import {
  forumPosts,
  forumCategories,
} from "../features/forum/data/forumData";

import {
  getForumPosts,
  createForumPost,
  updateForumPost,
  deleteForumPost,
} from "../services/forumService";

import { createNotification } from "../services/notificationService";

function Forum() {
  const { user, isCoach, isAdmin } = useAuth();
  const location = useLocation();

  const selectedPostId = new URLSearchParams(location.search).get("post");

  const canCreatePost = isCoach || isAdmin;

  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const loadPosts = async () => {
    try {
      const data = await getForumPosts();
      setPosts(data?.length > 0 ? data : forumPosts);
    } catch (error) {
      console.error(error);
      setPosts(forumPosts);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (!selectedPostId) return;

    setActiveCategory("All");

    setTimeout(() => {
      const postElement = document.getElementById(
        `post-${selectedPostId}`
      );

      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  }, [selectedPostId]);

  const createPost = async (postData) => {
    if (!canCreatePost) return;

    const newPostData = {
      ...postData,
      author: user?.name || "User",
      authorAvatar: user?.avatar || "",
      authorId: user?.id || user?.email || null,
      authorRole: user?.role || "athlete",
    };

    try {
      const createdPost = await createForumPost(newPostData);

      await loadPosts();

      await createNotification({
        type: "post",
        title: "New Forum Post",
        message: `${user?.name || "Someone"} created a new ${
          createdPost?.sport || newPostData.sport
        } post.`,
        userId: user?.id || user?.email,
        postId: createdPost?.id,
        link: `/forum?post=${createdPost?.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await deleteForumPost(postId);
      await loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const updatePost = async (updatedPost) => {
    try {
      await updateForumPost(
        updatedPost.id,
        updatedPost
      );

      await loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.sport === activeCategory);

  return (
    <main className="py-16">
      <Container>
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 mb-10">
          <SectionTitle
            title="Sports Forum"
            subtitle="Read coach posts, join discussions, ask questions, and interact with the SportsHub community."
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-fit">
            <h2 className="text-2xl font-bold mb-5 text-slate-950 dark:text-white">
              Categories
            </h2>

            <div className="space-y-3">
              {forumCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "w-full text-left bg-red-500 text-white px-4 py-3 rounded-xl transition"
                      : "w-full text-left bg-slate-100 text-slate-800 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:text-white px-4 py-3 rounded-xl transition"
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-3">
            {canCreatePost ? (
              <CreatePostForm onCreatePost={createPost} />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                <p className="text-slate-600 dark:text-slate-400">
                  Only approved coaches and admins can create forum posts.
                  You can still read posts, like them, and comment.
                </p>
              </div>
            )}

            <div className="space-y-5">
              {filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-600 dark:text-slate-400">
                  No posts found in this category.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    id={`post-${post.id}`}
                    className={
                      String(post.id) === String(selectedPostId)
                        ? "rounded-3xl ring-4 ring-red-500/40 transition"
                        : ""
                    }
                  >
                    <ForumPostCard
                      post={post}
                      onDeletePost={deletePost}
                      onUpdatePost={updatePost}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default Forum;