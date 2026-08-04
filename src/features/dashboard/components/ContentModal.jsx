import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

function ContentModal({
  formData,
  handleChange,
  addContent,
  closeModal,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6">
          Create New Content
        </h2>

        <form
          onSubmit={addContent}
          className="space-y-5"
        >
          <Input
            name="title"
            placeholder="Content title"
            value={formData.title}
            onChange={handleChange}
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
          >
            <option>Training Plan</option>
            <option>Forum Post</option>
          </select>

          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
          >
            <option>Fitness</option>
            <option>Boxing</option>
            <option>Bodybuilding</option>
            <option>Karate</option>
            <option>Taekwondo</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
          >
            <option>Draft</option>
            <option>Published</option>
          </select>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Create
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContentModal;