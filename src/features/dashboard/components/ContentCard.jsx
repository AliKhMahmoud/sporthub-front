import Button from "../../../components/ui/Button";

function ContentCard({ item, onEdit, onDelete }) {
  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-800/40 transition">
      <div>
        <h3 className="text-xl font-bold">
          {item.title}
        </h3>

        <p className="text-slate-400 mt-2">
          {item.type} • {item.sport}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={
            item.status === "Published"
              ? "bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold"
              : "bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold"
          }
        >
          {item.status}
        </span>

        <Button
          variant="secondary"
          className="px-4 py-2"
          onClick={() => onEdit(item)}
        >
          Edit
        </Button>

        <Button
          variant="outline"
          className="px-4 py-2"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default ContentCard;