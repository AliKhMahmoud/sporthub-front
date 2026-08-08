import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

// Map sport names to IDs (adjust these based on your backend)
const SPORT_MAP = {
  Fitness: "660f7a5c8f8f8f8f8f8f8f01",
  Boxing: "660f7a5c8f8f8f8f8f8f8f02",
  Bodybuilding: "660f7a5c8f8f8f8f8f8f8f03",
  Karate: "660f7a5c8f8f8f8f8f8f8f04",
  Taekwondo: "660f7a5c8f8f8f8f8f8f8f05",
};

function CreatePostForm({ onCreatePost }) {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    sport: "Fitness",
    media: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.title.trim()) {
      console.error("Title is required");
      return;
    }

    if (!formData.body.trim()) {
      console.error("Body/description is required");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for backend
      const postData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        sportId: SPORT_MAP[formData.sport],
        media: formData.media,
      };

      await onCreatePost(postData);

      // Reset form
      setFormData({
        title: "",
        body: "",
        sport: "Fitness",
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
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
        >
          <option value="Fitness">Fitness</option>
          <option value="Boxing">Boxing</option>
          <option value="Bodybuilding">Bodybuilding</option>
          <option value="Karate">Karate</option>
          <option value="Taekwondo">Taekwondo</option>
        </select>
      </div>

      <Button 
        type="submit" 
        className="w-full md:w-auto"
        disabled={isLoading}
      >
        {isLoading ? "Publishing..." : "Publish Post"}
      </Button>
    </form>
  );
}

export default CreatePostForm;