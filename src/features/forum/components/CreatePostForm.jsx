import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { getAllSports } from "../../../services/sportsService";

function CreatePostForm({ onCreatePost, sportsList = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    sportId: "",
    media: [],
  });

  const [sports, setSports] = useState(sportsList);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSports, setIsLoadingSports] = useState(!sportsList.length);

  useEffect(() => {
    if (sportsList && sportsList.length > 0) {
      setSports(sportsList);
      setIsLoadingSports(false);
      setFormData((prev) => ({
        ...prev,
        sportId: prev.sportId || sportsList[0]._id || sportsList[0].id,
      }));
    } else {
      const fetchSports = async () => {
        try {
          const response = await getAllSports();
          const list = response?.data || response || [];
          setSports(Array.isArray(list) ? list : []);

          if (list.length > 0) {
            setFormData((prev) => ({
              ...prev,
              sportId: list[0]._id || list[0].id,
            }));
          }
        } catch (error) {
          console.error("Error fetching sports:", error);
          } finally {
          setIsLoadingSports(false);
        }
      };

      fetchSports();
    }
  }, [sportsList]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.body.trim() || !formData.sportId) {
      return;
    }

    setIsLoading(true);

    try {
      const postData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        sportId: formData.sportId,
        media: formData.media,
      };

      await onCreatePost(postData);

      setFormData({
        title: "",
        body: "",
        sportId: sports.length > 0 ? sports[0]._id || sports[0].id : "",
        media: [],
      });
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 space-y-4 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        Create New Post
      </h2>

      <Input
        name="title"
        placeholder="What's the title of your post?"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="body"
        placeholder="Write your post content here..."
        value={formData.body}
        onChange={handleChange}
        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white resize-none min-h-24"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="sportId"
          value={formData.sportId}
          onChange={handleChange}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
          required
        >
          {isLoadingSports ? (
            <option value="">Loading sports...</option>
          ) : sports.length === 0 ? (
            <option value="">No sports available</option>
          ) : (
            sports.map((sport) => {
              const sportId = sport._id || sport.id;
              return (
                <option key={sportId} value={sportId}>
                  {sport.name}
                </option>
              );
            })
          )}
        </select>
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto"
        disabled={isLoading || isLoadingSports}
      >
        {isLoading ? "Publishing..." : "Publish Post"}
      </Button>
    </form>
  );
}

export default CreatePostForm;