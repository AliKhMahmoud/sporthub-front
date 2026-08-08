import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";

import ForumPostCard from "../features/forum/components/ForumPostCard";
import CreatePostForm from "../features/forum/components/CreatePostForm";

import { useAuth } from "../context/AuthContext";

import { forumCategories } from "../features/forum/data/forumData";

// استدعاء الخدمات من الملف الموحد الذي أنشأناه
import {
  getForumPosts,
  getPostsBySport,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  
} from "../services/forumService";

function Forum() {
  const { user, isCoach, isAdmin } = useAuth();
  const location = useLocation();

  const selectedPostId = new URLSearchParams(location.search).get("post");

  // الصلاحية: المدربين أو الآدمن
  const canCreatePost = isCoach || isAdmin || user?.role === "publisher";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // جلب المنشورات من الباك إند
  const loadPosts = async (category = activeCategory) => {
    setLoading(true);
    try {
      let res;
      if (category === "All") {
        res = await getForumPosts();
      } else {
        // إذا كان الفلتر بحسب الرياضة
        res = await getPostsBySport(category);
      }

      // الباك إند يرجع البيانات داخل res.data.posts أو res.data مباشرة
      const fetchedPosts = res?.data?.posts || res?.data || [];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(activeCategory);
  }, [activeCategory]);

  // التمرير التلقائي للبوست المحدد عبر URL Query
  useEffect(() => {
    if (!selectedPostId) return;

    setActiveCategory("All");

    const timer = setTimeout(() => {
      const postElement = document.getElementById(`post-${selectedPostId}`);
      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPostId]);

  // إنشاء منشور جديد
  const createPost = async (postData) => {
    if (!canCreatePost) return;

    try {
      // الباك إند يأخذ الـ author تلقائياً من الـ Token
      await createForumPost(postData);
      await loadPosts(); // إعادة تحميل المنشورات
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  // حذف منشور
  const deletePost = async (postId) => {
    try {
      await deleteForumPost(postId);
      await loadPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  // تعديل منشور
  const updatePost = async (postId, updatedData) => {
    try {
      await updateForumPost(postId, updatedData);
      await loadPosts();
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

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
          {/* Aside Filter Categories */}
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

          {/* Main Posts Area */}
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
              {loading ? (
                <div className="text-center py-10 text-slate-500">
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-600 dark:text-slate-400">
                  No posts found in this category.
                </div>
              ) : (
                posts.map((post) => {
                  const postId = post._id || post.id;
                  return (
                    <div
                      key={postId}
                      id={`post-${postId}`}
                      className={
                        String(postId) === String(selectedPostId)
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
                  );
                })
              )}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

export default Forum;