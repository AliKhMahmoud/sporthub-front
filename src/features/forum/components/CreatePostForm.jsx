import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

function CreatePostForm({ onCreatePost }) {
  const [formData, setFormData] = useState({
    title: "",
    sport: "Fitness",
    tag: "Discussion",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;

    onCreatePost(formData);

    setFormData({
      title: "",
      sport: "Fitness",
      tag: "Discussion",
    });
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
        placeholder="What do you want to discuss?"
        value={formData.title}
        onChange={handleChange}
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

        <select
          name="tag"
          value={formData.tag}
          onChange={handleChange}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
        >
          <option value="Discussion">Discussion</option>
          <option value="Question">Question</option>
          <option value="Training">Training</option>
          <option value="Progress">Progress</option>
        </select>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        Publish Post
      </Button>
    </form>
  );
}

export default CreatePostForm;