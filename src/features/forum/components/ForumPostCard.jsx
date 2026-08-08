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
  updatePostComment,
  deletePostComment,
  togglePostLike,
} from "../../../services/forumInteractionService";

function ForumPostCard({ post, onDeletePost, onUpdatePost }) {
  const { user: currentUser } = useAuth();

  const currentUserId = currentUser?.id || currentUser?.email;
  const postId = post._id || post.id;
  const postOwnerId = post.author?._id || post.authorId || post.authorEmail;

  const [liked, setLiked] = useState(
    post.likedByMe || post.isLiked || false
  );

  const [likesCount, setLikesCount] = useState(
    post.likesCount || post.likes || 0
  );

  const [comments, setComments] = useState(
    post.commentsList || post.comments || []
  );

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [editPostData, setEditPostData] = useState({
    title: post.title || "",
    sport: post.sport?.name || post.sport || "Fitness",
    tag: post.tag || "Discussion",
  });

  const canManagePost =
    currentUserId &&
    postOwnerId &&
    String(postOwnerId) === String(currentUserId);

  useEffect(() => {
    setLiked(post.likedByMe || post.isLiked || false);
    setLikesCount(post.likesCount || post.likes || 0);
    setComments(post.commentsList || post.comments || []);
  }, [post]);

  const loadComments = async () => {
    try {
      const data = await getPostComments(postId);
      setComments(data?.data || data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const openComments = async () => {
    setIsCommentsOpen(true);
    await loadComments();
  };

  const toggleLikeHandler = async () => {
    if (!currentUserId) return;

    try {
      const result = await togglePostLike(postId);
      const resData = result?.data || result;

      setLiked(resData?.liked || false);
      setLikesCount(resData?.likesCount || 0);

      if (
        resData?.liked &&
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
      console.error(error);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();

    if (!currentUserId) return;
    if (commentText.trim() === "") return;

    try {
      const response = await createPostComment(postId, {
        text: commentText,
      });
      const createdComment = response?.data || response;

      setComments((prev) => [createdComment, ...prev]);
      setCommentText("");

      if (
        postOwnerId &&
        String(postOwnerId) !== String(currentUserId)
      ) {
        await createNotification({
          type: "comment",
          title: "New Comment",
          message: `${currentUser?.name || "Someone"} commented on your post: ${post.title}`,
          userId: postOwnerId,
          senderId: currentUserId,
          postId: postId,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    try {
      await deletePostComment(postId, commentId);

      setComments((prev) =>
        prev.filter(
          (comment) =>
            String(comment._id || comment.id) !== String(commentId)
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const editComment = async (commentId) => {
    const currentComment = comments.find(
      (comment) =>
        String(comment._id || comment.id) === String(commentId)
    );

    const newText = window.prompt(
      "Edit your comment:",
      currentComment?.text || ""
    );

    if (!newText || newText.trim() === "") return;

    try {
      const response = await updatePostComment(postId, commentId, {
        text: newText,
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
      console.error(error);
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
    if (editPostData.title.trim() === "") return;

    onUpdatePost(postId, {
      ...post,
      ...editPostData,
    });

    setIsEditPostOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 transition">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <span className="text-red-500 dark:text-red-400 font-semibold">
              {typeof post.sport === "object" ? post.sport?.name : post.sport}
            </span>

            <h2 className="text-2xl font-bold mt-3 mb-3 text-slate-950 dark:text-white">
              {post.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-5">
              Posted by {post.author?.name || post.author || "User"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full text-sm">
              {post.tag}
            </span>

            {canManagePost && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPostOpen(true)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition"
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePost(postId)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6 text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={toggleLikeHandler}
            className="flex items-center gap-2 hover:text-red-500 transition"
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
              />

              <select
                name="sport"
                value={editPostData.sport}
                onChange={handlePostEditChange}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
              >
                <option>Fitness</option>
                <option>Boxing</option>
                <option>Bodybuilding</option>
                <option>Karate</option>
                <option>Taekwondo</option>
              </select>

              <select
                name="tag"
                value={editPostData.tag}
                onChange={handlePostEditChange}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
              >
                <option>Discussion</option>
                <option>Question</option>
                <option>Training</option>
                <option>Progress</option>
              </select>

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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                  Comments
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {post.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(false)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:border-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={addComment}
              className="flex flex-col md:flex-row gap-4 mb-6"
            >
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
              <Button type="submit">Comment</Button>
            </form>

            <div className="max-h-80 overflow-y-auto space-y-4">
              {comments.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                  No comments yet.
                </p>
              ) : (
                comments.messages || comments.map((comment) => {
                  const commentId = comment._id || comment.id;
                  const commentOwnerId =
                    comment.userId ||
                    comment.authorId ||
                    comment.user?._id ||
                    comment.user?.id ||
                    comment.author?._id;

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
                        <div>
                          <h3 className="font-bold text-red-500 dark:text-red-400 mb-2">
                            {comment.user?.name ||
                              comment.authorName ||
                              comment.author?.name ||
                              "User"}
                          </h3>
                          <p className="text-slate-700 dark:text-slate-300">
                            {comment.text}
                          </p>
                        </div>

                        {canManageComment && (
                          <div className="flex gap-2">
                            {/* زر التعديل */}
                            <button
                              type="button"
                              onClick={() => editComment(commentId)}
                              className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* زر الحذف */}
                            <button
                              type="button"
                              onClick={() => deleteCommentHandler(commentId)}
                              className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition"
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