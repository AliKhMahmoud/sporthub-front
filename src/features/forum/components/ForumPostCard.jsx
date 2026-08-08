import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import { createNotification } from "../../../services/notificationService";

import {
  getPostComments,
  createPostComment,
  deletePostComment,
  unlikePost,
  likePost,
  updateComment,
} from "../../../services/forumService";

function ForumPostCard({ post, onDeletePost, onUpdatePost }) {
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?.id || currentUser?.email;
  const postId = post._id || post.id;
  const postOwnerId = post.author?._id || post.author?.id || post.authorId;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const [comments, setComments] = useState([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const [editPostData, setEditPostData] = useState({
    title: post.title || "",
    body: post.body || "",
  });
  console.log("Comment Data:", comments);
  const canManagePost =
    currentUserId &&
    postOwnerId &&
    String(postOwnerId) === String(currentUserId);

  // Check if user already liked this post
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

  const openComments = async () => {
    setIsCommentsOpen(true);
    await loadComments();
  };

  const toggleLikeHandler = async () => {
    if (!currentUserId) return;

    try {
      if (liked) {
        // إذا كان معجباً به مسبقاً، نقوم بإلغاء الإعجاب
        await unlikePost(postId);
        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // إذا لم يكن معجباً به، نقوم بإضافة إعجاب
        await likePost(postId);
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }

      // إرسال إشعار لصاحب المنشور إذا لم يكن المستخدم الحالي هو صاحب المنشور
      if (
        !liked &&
        postOwnerId &&
        String(postOwnerId) !== String(currentUserId)
      ) {
        await createNotification({
          type: "like",
          title: "New Like",
          message: `${currentUser?.name || "Someone"} liked your post: ${post.title}`,
          userId: postOwnerId,
          senderId: currentUserId,
          postId: postId,
        });
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();

    if (!currentUserId) {
      console.error("User not authenticated");
      return;
    }

    if (!commentText.trim()) {
      console.error("Comment text is required");
      return;
    }

    try {
      const response = await createPostComment(postId, {
        body: commentText.trim(),
      });
      const createdComment = response?.data || response;

      setComments((prev) => [createdComment, ...prev]);
      setCommentText("");

      // Send notification to post owner
      if (
        postOwnerId &&
        String(postOwnerId) !== String(currentUserId) &&
        currentUser
      ) {
        await createNotification({
          type: "POST_COMMENTED",
          title: "New Comment",
          message: `${currentUser.name || "Someone"} commented on your post: "${post.title}"`,
          userId: postOwnerId,
          senderId: currentUserId,
          postId: postId,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    try {
      await deletePostComment(commentId);

      setComments((prev) =>
        prev.filter(
          (comment) =>
            String(comment._id || comment.id) !== String(commentId)
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const editComment = async (commentId) => {
    const currentComment = comments.find(
      (comment) =>
        String(comment._id || comment.id) === String(commentId)
    );

    const newText = window.prompt(
      "Edit your comment:",
      currentComment?.body || ""
    );

    if (!newText || newText.trim() === "") return;

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
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handlePostEditChange = (event) => {
    const { name, value } = event.target;
    setEditPostData({
      ...editPostData,
      [name]: value,
    });
  };

  const savePostEdit = (event) => {
    event.preventDefault();

    if (!canManagePost) return;
    if (!editPostData.title.trim()) {
      console.error("Title is required");
      return;
    }
    if (!editPostData.body.trim()) {
      console.error("Body is required");
      return;
    }

    onUpdatePost(postId, editPostData);
    setIsEditPostOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 transition">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex-1">
            <span className="text-red-500 dark:text-red-400 font-semibold">
              {typeof post.sport === "object" ? post.sport?.name : post.sport}
            </span>

            <h2 className="text-2xl font-bold mt-3 mb-3 text-slate-950 dark:text-white">
              {post.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {post.body}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Posted by {post.author?.name || "User"}
            </p>
          </div>

          {canManagePost && (
            <div className="flex gap-2 flex-shrink-0">
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
            </div>
          )}
        </div>

        <div className="flex gap-6 text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={toggleLikeHandler}
            className="flex items-center gap-2 hover:text-red-500 transition"
            title={liked ? "Unlike post" : "Like post"}
          >
            <Heart
              size={20}
              className={
                liked
                  ? "text-red-500 fill-red-500"
                  : "text-slate-500 dark:text-slate-300"
              }
            />
            <span>{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={openComments}
            className="flex items-center gap-2 hover:text-red-500 transition"
            title="View comments"
          >
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Edit Post Modal */}
      {isEditPostOpen && canManagePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                Edit Post
              </h2>
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
                <Button type="submit" className="flex-1">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditPostOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {isCommentsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                  Comments
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">
                  {post.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:border-red-500 transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {currentUserId && (
              <form
                onSubmit={addComment}
                className="flex flex-col gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800"
              >
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <Button type="submit" className="w-full">
                  Post Comment
                </Button>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoadingComments ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
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
                          <h3 className="font-bold text-red-500 dark:text-red-400 mb-2">
                            {comment.author?.name || "User"}
                          </h3>
                          <p className="text-slate-700 dark:text-slate-300">
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
      )}
    </>
  );
}

export default ForumPostCard;