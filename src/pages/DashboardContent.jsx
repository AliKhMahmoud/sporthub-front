import { useEffect, useState } from "react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";

import ContentCard from "../features/dashboard/components/ContentCard";
import ContentModal from "../features/dashboard/components/ContentModal";
import {
  getDashboardContent,
  createDashboardContent,
  updateDashboardContent,
  deleteDashboardContent as deleteDashboardContentService,
} from "../services/dashboardService";

const defaultItems = [
  {
    id: 1,
    title: "Beginner Boxing Plan",
    type: "Training Plan",
    sport: "Boxing",
    status: "Published",
  },
  {
    id: 2,
    title: "Best Cardio Routine",
    type: "Forum Post",
    sport: "Fitness",
    status: "Draft",
  },
  {
    id: 3,
    title: "Advanced Karate Training",
    type: "Training Plan",
    sport: "Karate",
    status: "Published",
  },
];

function DashboardContent() {
  const [items, setItems] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    title: "",
    type: "Training Plan",
    sport: "Fitness",
    status: "Draft",
  });

  useEffect(() => {
  loadContent();
}, []);

const loadContent = async () => {
  try {
    const data = await getDashboardContent();

    setItems(data || []);
  } catch (error) {
    console.error(error);

    setItems(defaultItems);
  }
};

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      setToast({
        message: "",
        type: "success",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "Training Plan",
      sport: "Fitness",
      status: "Draft",
    });

    setEditingItem(null);
  };

  const openCreateModal = () => {
    resetForm();

    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();

    setIsModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const deleteContent = async (id) => {
  try {
    await deleteDashboardContentService(id);

    await loadContent();

    setToast({
      message: "Content deleted successfully",
      type: "error",
    });
  } catch (error) {
    console.error(error);
  }
};

  const editContent = (item) => {
    setEditingItem(item);

    setFormData({
      title: item.title,
      type: item.type,
      sport: item.sport,
      status: item.status,
    });

    setIsModalOpen(true);
  };

  const addContent = async (event) => {
  event.preventDefault();

  if (formData.title.trim() === "") return;

  try {
    if (editingItem) {
      await updateDashboardContent(
        editingItem.id,
        formData
      );

      setToast({
        message: "Content updated successfully",
        type: "success",
      });
    } else {
      await createDashboardContent(formData);

      setToast({
        message: "Content created successfully",
        type: "success",
      });
    }

    await loadContent();
    closeModal();
  } catch (error) {
    console.error(error);

    setToast({
      message: "Something went wrong",
      type: "error",
    });
  }
};

  return (
    <main className="p-10 text-white">
      <Toast
        message={toast.message}
        type={toast.type}
      />

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            Content Management
          </h1>

          <p className="text-slate-400 text-lg">
            Manage training plans and forum posts.
          </p>
        </div>
<Button onClick={openCreateModal}>
          Create New
        </Button>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h2 className="text-2xl font-bold">
                Published Content
              </h2>

              <p className="text-slate-400 mt-2">
                {filteredItems.length} result(s)
                found
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                className="md:w-72"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
              >
                <option>All</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No content matches your search.
            </div>
          ) : (
            filteredItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onEdit={editContent}
                onDelete={deleteContent}
              />
            ))
          )}
        </div>
      </section>

      {isModalOpen && (
        <ContentModal
          formData={formData}
          handleChange={handleChange}
          addContent={addContent}
          closeModal={closeModal}
        />
      )}
    </main>
  );
}

export default DashboardContent;