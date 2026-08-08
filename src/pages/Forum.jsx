import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";

import ForumPostCard from "../features/forum/components/ForumPostCard";
import CreatePostForm from "../features/forum/components/CreatePostForm";

import { useAuth } from "../context/AuthContext";

import {
  getForumPosts,
  getPostsBySport,
  createForumPost,
  deleteForumPost,
  updateForumPost,
} from "../services/forumService";
import { getAllSports } from "../services/sportsService";

// استيراد دالة جلب الرياضات (تأكد من مسار ملف الـ service لديك)

function Forum() {
  const { user, isCoach, isAdmin } = useAuth();
  const location = useLocation();

  const selectedPostId = new URLSearchParams(location.search).get("post");

  const canCreatePost = isCoach || isAdmin || user?.role === "publisher";

  const [posts, setPosts] = useState([]);
  const [sports, setSports] = useState([]); // قائمة الرياضات الحقيقية من الداتابيس
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All"); // "All" أو sportId
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. جلب الرياضات عند تحميل الصفحة أول مرة
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await getAllSports();
        const sportsList = response?.data || response || [];
        setSports(Array.isArray(sportsList) ? sportsList : []);
      } catch (error) {
        console.error("Error fetching sports list:", error);
      }
    };
    fetchSports();
  }, []);

  // 2. تحميل المنشورات بناءً على الفلتر (All أو Sport ID)
  const loadPosts = async (category = activeCategory, page = 1) => {
    setLoading(true);
    try {
      let response;
      const params = {
        page,
        limit: 10,
        sort: "latest",
      };

      if (category === "All") {
        response = await getForumPosts(params);
      } else {
        // نرسل الـ sportId الحقيقي بدلاً من الاسم النصي
        response = await getPostsBySport(category, params);
      }

      const responseData = response?.data || response;
      const fetchedPosts = responseData?.posts || [];
      const pagination = responseData?.pagination || {};

      setPosts(fetchedPosts);
      setCurrentPage(pagination.page || 1);
      setTotalPages(pagination.pages || 1);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(activeCategory, currentPage);
  }, [activeCategory, currentPage]);

  useEffect(() => {
    if (!selectedPostId) return;

    setActiveCategory("All");
    setCurrentPage(1);

    const timer = setTimeout(() => {
      const postElement = document.getElementById(`post-${selectedPostId}`);
      if (postElement) {
        postElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedPostId]);

  const createPost = async (postData) => {
    if (!canCreatePost) return;
    try {
      await createForumPost(postData);
      setCurrentPage(1);
      await loadPosts(activeCategory, 1);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteForumPost(postId);
      await loadPosts(activeCategory, currentPage);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const updatePost = async (postId, updatedData) => {
    try {
      await updateForumPost(postId, updatedData);
      await loadPosts(activeCategory, currentPage);
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
          {/* Aside Filter Categories (Dynamic) */}
          <aside className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-fit">
            <h2 className="text-2xl font-bold mb-5 text-slate-950 dark:text-white">
              Categories
            </h2>

            <div className="space-y-3">
              {/* زر الكل */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setCurrentPage(1);
                }}
                className={
                  activeCategory === "All"
                    ? "w-full text-left bg-red-500 text-white px-4 py-3 rounded-xl transition"
                    : "w-full text-left bg-slate-100 text-slate-800 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:text-white px-4 py-3 rounded-xl transition"
                }
              >
                All
              </button>

              {/* أزرار الرياضات القادمة من قاعدة البيانات */}
              {sports.map((sport) => {
                const sportId = sport._id || sport.id;
                return (
                  <button
                    key={sportId}
                    type="button"
                    onClick={() => {
                      setActiveCategory(sportId); // نمرر الـ ID عند الضغط
                      setCurrentPage(1);
                    }}
                    className={
                      activeCategory === sportId
                        ? "w-full text-left bg-red-500 text-white px-4 py-3 rounded-xl transition"
                        : "w-full text-left bg-slate-100 text-slate-800 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:text-white px-4 py-3 rounded-xl transition"
                    }
                  >
                    {sport.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Posts Area */}
          <div className="lg:col-span-3">
            {canCreatePost ? (
              <CreatePostForm onCreatePost={createPost} sportsList={sports} />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
                <p className="text-slate-600 dark:text-slate-400">
                  Only approved coaches and admins can create forum posts.
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 transition"
                >
                  Previous
                </button>

                <span className="text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}

export default Forum;