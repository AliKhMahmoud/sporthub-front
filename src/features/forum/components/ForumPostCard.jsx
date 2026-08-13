import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  X,
  Pencil,
  Trash2,
  Maximize2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import {
  getPostComments,
  createPostComment,
  deletePostComment,
  unlikePost,
  likePost,
  updateComment,
} from "../../../services/forumService";
import { CustomAlert } from "../../../components/CustomAlert";

function ForumPostCard({ post, onDeletePost, onUpdatePost }) {
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.email;
  const postId = post._id || post.id;
  const postOwnerId = post.author?._id || post.author?.id || post.authorId;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const [comments, setComments] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const [editPostData, setEditPostData] = useState({
    title: post.title || "",
    body: post.body || "",
  });

  const canManagePost =
    currentUserId &&
    postOwnerId &&
    String(postOwnerId) === String(currentUserId);

  useEffect(() => {
    if (post.likes && Array.isArray(post.likes)) {
      const userLiked = post.likes.some(
        (like) =>
          (like._id || like) === currentUserId ||
          like.toString() === currentUserId
      );
      setLiked(userLiked);
      setLikesCount(post.likes.length);
    }
  }, [post, currentUserId]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await getPostComments(postId);
      const commentsList = data?.data || data || [];
      setComments(Array.isArray(commentsList) ? commentsList : []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const openDetailsModal = async () => {
    setIsDetailsOpen(true);
    await loadComments();
  };

  const toggleLikeHandler = async () => {
    if (!currentUserId) return;

    try {
      if (liked) {
        await unlikePost(postId);
        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await likePost(postId);
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();

    if (!currentUserId || !commentText.trim()) return;

    try {
      const response = await createPostComment(postId, {
        body: commentText.trim(),
      });
      const createdComment = response?.data || response;

      setComments((prev) => [createdComment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      CustomAlert.error(error, "Failed to Add Comment");
    }
  };

  // ─── 1. حذف التعليق ───
  const deleteCommentHandler = async (commentId) => {
    const isConfirmed = await CustomAlert.confirmDelete(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      "Yes, Delete"
    );

    if (!isConfirmed) return;

    try {
      await deletePostComment(commentId);
      setComments((prev) =>
        prev.filter(
          (comment) =>
            String(comment._id || comment.id) !== String(commentId)
        )
      );
      CustomAlert.success("Deleted!", "Comment removed successfully.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      CustomAlert.error(error, "Failed to Delete Comment");
    }
  };

  // ─── 2. تعديل التعليق باستخدام CustomAlert.prompt المخصص ───
  const editComment = async (commentId) => {
    const currentComment = comments.find(
      (comment) => String(comment._id || comment.id) === String(commentId)
    );

    // استدعاء الدايالوج المخصص بأسلوب المكونات الموحدة
    const newText = await CustomAlert.prompt(
      "Edit Comment",
      "Update your comment text below:",
      currentComment?.body || "",
      "Write your comment here...",
      "Save Changes"
    );

    // إذا ضغط المستخدم Cancel أو لم يغير النص أو أرسل نصاً فارغاً
    if (newText === null || newText.trim() === "" || newText.trim() === currentComment?.body) return;

    try {
      const response = await updateComment(commentId, {
        body: newText.trim(),
      });
      const updatedComment = response?.data || response;

      setComments((prev) =>
        prev.map((comment) =>
          String(comment._id || comment.id) === String(commentId)
            ? updatedComment
            : comment
        )
      );
      CustomAlert.success("Updated!", "Comment updated successfully.");
    } catch (error) {
      console.error("Error updating comment:", error);
      CustomAlert.error(error, "Failed to Update Comment");
    }
  };

  const handlePostEditChange = (event) => {
    const { name, value } = event.target;
    setEditPostData({
      ...editPostData,
      [name]: value,
    });
  };

  // ─── 3. حفظ تعديل المنشور ───
  const savePostEdit = async (event) => {
    event.preventDefault();
    if (!canManagePost || !editPostData.title.trim() || !editPostData.body.trim()) return;

    await onUpdatePost(postId, editPostData);
    setIsEditPostOpen(false);
  };

  return (
    <>
      {/* Card Preview */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 transition flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1">
              <span className="text-red-500 dark:text-red-400 font-semibold text-sm">
                {typeof post.sport === "object" ? post.sport?.name : post.sport}
              </span>

              <h2 
                onClick={openDetailsModal}
                className="text-2xl font-bold mt-3 mb-3 text-slate-950 dark:text-white cursor-pointer hover:text-red-500 transition"
              >
                {post.title}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {post.body}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Posted by {post.author?.name || "User"}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={openDetailsModal}
                className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                title="View full post & comments"
              >
                <Maximize2 size={17} />
              </button>

              {canManagePost && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditPostOpen(true)}
                    className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition"
                    title="Edit post"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePost(postId)}
                    className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                    title="Delete post"
                  >
                    <Trash2 size={17} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={toggleLikeHandler}
            className="flex items-center gap-2 hover:text-red-500 transition"
          >
            <Heart
              size={20}
              className={liked ? "text-red-500 fill-red-500" : "text-slate-500 dark:text-slate-300"}
            />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={openDetailsModal}
            className="flex items-center gap-2 hover:text-red-500 transition"
          >
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Edit Post Modal */}
      {isEditPostOpen && canManagePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Edit Post</h2>
              <button
                type="button"
                onClick={() => setIsEditPostOpen(false)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={savePostEdit} className="space-y-5">
              <Input
                name="title"
                value={editPostData.title}
                onChange={handlePostEditChange}
                placeholder="Post title"
                required
              />

              <textarea
                name="body"
                value={editPostData.body}
                onChange={handlePostEditChange}
                placeholder="Post content"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white resize-none min-h-24"
                required
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Save</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditPostOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Post Details & Comments Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 sm:px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-red-500 dark:text-red-400 font-semibold text-sm">
                  {typeof post.sport === "object" ? post.sport?.name : post.sport}
                </span>
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mt-1">
                  {post.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Posted by {post.author?.name || "User"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:border-red-500 transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {post.body}
              </div>

              <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-4">
                <button
                  type="button"
                  onClick={toggleLikeHandler}
                  className="flex items-center gap-2 hover:text-red-500 transition"
                >
                  <Heart
                    size={20}
                    className={liked ? "text-red-500 fill-red-500" : "text-slate-500 dark:text-slate-300"}
                  />
                  <span>{likesCount} Likes</span>
                </button>
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <span>{comments.length} Comments</span>
                </div>
              </div>

              {/* Add Comment Form */}
              {currentUserId ? (
                <form onSubmit={addComment} className="flex flex-col gap-3">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                  />
                  <Button type="submit" className="w-full">
                    Post Comment
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">
                  Please log in to leave a comment.
                </p>
              )}

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Discussion</h3>
                
                {isLoadingComments ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-6">
                    Loading comments...
                  </p>
                ) : comments.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-6">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => {
                    const commentId = comment._id || comment.id;
                    const commentOwnerId =
                      comment.author?._id ||
                      comment.author?.id ||
                      comment.userId ||
                      comment.authorId;

                    const canManageComment =
                      currentUserId &&
                      commentOwnerId &&
                      String(commentOwnerId) === String(currentUserId);

                    return (
                      <div
                        key={commentId}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-red-500 dark:text-red-400 mb-1 text-sm">
                              {comment.author?.name || "User"}
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 text-sm">
                              {comment.body}
                            </p>
                          </div>

                          {canManageComment && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => editComment(commentId)}
                                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                                title="Edit comment"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteCommentHandler(commentId)}
                                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                                title="Delete comment"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default ForumPostCard;