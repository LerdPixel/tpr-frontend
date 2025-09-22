import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
import { Context } from "../context/index.ts";
import MyModal from "../components/ui/MyModal/MyModal.tsx";

interface LectureMaterial {
  id: number;
  title: string;
  description?: string;
  discipline_ids: number[]; // Changed from discipline_id to discipline_ids array
  file_name: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
  created_by: number;
  updated_at: string;
  file_path: string;
}

interface MaterialsResponse {
  items: LectureMaterial[];
  limit: number;
  offset: number;
  total: number;
}

interface Discipline {
  id: number;
  name: string;
  description?: string;
  lecture_count?: number;
  lecture_points?: number;
}

interface UploadForm {
  title: string;
  description: string;
  discipline_ids: number[]; // Changed from discipline_id to discipline_ids array
  file: File | null;
}

interface EditForm {
  title: string;
  description: string;
  discipline_ids: number[]; // Changed from lecture_no to discipline_ids array
}

const MaterialsPage: React.FC = () => {
  const { store } = useContext(Context);
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(
    null
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<LectureMaterial | null>(null);

  const [uploadForm, setUploadForm] = useState<UploadForm>({
    title: "",
    description: "",
    discipline_ids: [], // Changed from discipline_id to discipline_ids array
    file: null,
  });

  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    discipline_ids: [], // Changed from lecture_no to discipline_ids array
  });

  const getAccess = () => {
    const access_token = localStorage.getItem("token");
    if (access_token == null) {
      store.refresh();
    }
    return access_token;
  };

  useEffect(() => {
    console.log("MaterialsPage: Component mounted, loading data...");
    loadData();
  }, [store.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("MaterialsPage: Current role:", store.role);

      // Load disciplines first
      await loadDisciplines();

      // Load materials based on role
      await loadMaterials();
    } catch (err: any) {
      console.error("MaterialsPage: Error loading data:", err);
      setError(
        err.response?.data?.error || err.message || "Ошибка загрузки данных"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDisciplines = async () => {
    try {
      console.log("MaterialsPage: Loading disciplines...");
      const response = await axios.get<Discipline[]>("/server/disciplines", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      console.log("MaterialsPage: Disciplines loaded:", response.data);
      setDisciplines(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error("MaterialsPage: Error loading disciplines:", err);
      throw err;
    }
  };

  const loadMaterials = async () => {
    try {
      console.log("MaterialsPage: Loading materials for role:", store.role);

      let materialsData: LectureMaterial[] = [];

      if (store.role === "admin") {
        console.log("role is admin");

        // Admin can see all materials
        const response = await axios.get<MaterialsResponse>(
          "/server/admin/materials",
          {
            headers: { Authorization: `Bearer ${getAccess()}` },
          }
        );
        console.log("MaterialsPage: Admin materials loaded:", response.data);
        materialsData = Array.isArray(response.data?.items)
          ? response.data.items
          : [];
      } else if (store.role === "seminarist") {
        // Seminarist can see all materials they have access to
        const response = await axios.get<MaterialsResponse>(
          "/server/seminarist/materials",
          {
            headers: { Authorization: `Bearer ${getAccess()}` },
          }
        );
        console.log(
          "MaterialsPage: Seminarist materials loaded:",
          response.data
        );
        materialsData = Array.isArray(response.data?.items)
          ? response.data.items
          : [];
      } else {
        // Students need to get materials per discipline
        const disciplineIds = await getUserDisciplineIds();
        console.log("MaterialsPage: Student discipline IDs:", disciplineIds);

        for (const disciplineId of disciplineIds) {
          try {
            const response = await axios.get<LectureMaterial[]>(
              `/server/disciplines/${disciplineId}/materials`,
              {
                headers: { Authorization: `Bearer ${getAccess()}` },
              }
            );
            console.log(
              `MaterialsPage: Materials for discipline ${disciplineId}:`,
              response.data
            );
            const disciplineMaterials = Array.isArray(response.data)
              ? response.data
              : [];
            materialsData = [...materialsData, ...disciplineMaterials];
          } catch (err: any) {
            console.error(
              `MaterialsPage: Error loading materials for discipline ${disciplineId}:`,
              err
            );
          }
        }
      }

      console.log("MaterialsPage: All materials loaded:", materialsData);
      setMaterials(materialsData);
    } catch (err: any) {
      console.error("MaterialsPage: Error loading materials:", err);
      throw err;
    }
  };

  const getUserDisciplineIds = async (): Promise<number[]> => {
    try {
      const response = await axios.get<number[]>("/server/disciplines/my-ids", {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      console.log("MaterialsPage: User discipline IDs:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      console.error("MaterialsPage: Error loading user discipline IDs:", err);
      return [];
    }
  };

  const handleUpload = async () => {
    if (
      !uploadForm.title ||
      uploadForm.discipline_ids.length === 0 ||
      !uploadForm.file
    ) {
      setError("Заполните все обязательные поля");
      return;
    }

    try {
      console.log("MaterialsPage: Uploading material:", uploadForm);

      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);

      // Append each discipline ID as a separate parameter
      uploadForm.discipline_ids.forEach((id) => {
        formData.append("discipline_ids[]", id.toString());
      });

      formData.append("file", uploadForm.file);

      const response = await axios.post("/server/admin/materials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getAccess()}`,
        },
      });

      console.log(
        "MaterialsPage: Material uploaded successfully:",
        response.data
      );

      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        discipline_ids: [], // Reset to empty array
        file: null,
      });

      await loadMaterials();
    } catch (err: any) {
      console.error("MaterialsPage: Error uploading material:", err);
      setError(err.response?.data?.error || "Ошибка загрузки материала");
    }
  };

  const handleEdit = async () => {
    if (!editingMaterial || !editForm.title) {
      setError("Заполните все обязательные поля");
      return;
    }

    try {
      console.log(
        "MaterialsPage: Updating material:",
        editingMaterial.id,
        editForm
      );

      const response = await axios.put(
        `/server/admin/materials/${editingMaterial.id}`,
        {
          title: editForm.title,
          description: editForm.description,
          discipline_ids: editForm.discipline_ids, // Changed from lecture_no to discipline_ids
        },
        {
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      console.log(
        "MaterialsPage: Material updated successfully:",
        response.data
      );

      setShowEditModal(false);
      setEditingMaterial(null);
      setEditForm({
        title: "",
        description: "",
        discipline_ids: [], // Changed from lecture_no to discipline_ids
      });

      await loadMaterials();
    } catch (err: any) {
      console.error("MaterialsPage: Error updating material:", err);
      setError(err.response?.data?.error || "Ошибка обновления материала");
    }
  };

  const handleDelete = async (materialId: number) => {
    try {
      console.log("MaterialsPage: Deleting material:", materialId);

      await axios.delete(`/server/admin/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${getAccess()}` },
      });
      console.log("MaterialsPage: Material deleted successfully");

      await loadMaterials();
    } catch (err: any) {
      console.error("MaterialsPage: Error deleting material:", err);
      setError(err.response?.data?.error || "Ошибка удаления материала");
    }
  };

  const handleDownload = async (material: LectureMaterial) => {
    try {
      console.log("MaterialsPage: Downloading material:", material.id);

      const response = await axios.get(
        `/server/materials/${material.id}/download`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${getAccess()}` },
        }
      );

      console.log("MaterialsPage: Material downloaded successfully");

      const url = window.URL.createObjectURL(response.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", material.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("MaterialsPage: Error downloading material:", err);
      setError(err.response?.data?.error || "Ошибка загрузки файла");
    }
  };

  const openEditModal = (material: LectureMaterial) => {
    setEditingMaterial(material);
    setEditForm({
      title: material.title,
      description: material.description || "",
      discipline_ids: material.discipline_ids || [], // Changed from lecture_no to discipline_ids
    });
    setShowEditModal(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // const getDisciplineName = (disciplineId: number): string => {
  //   const discipline = disciplines.find((d) => d.id === disciplineId);
  //   return discipline ? discipline.name : `Дисциплина ${disciplineId}`;
  // };

  const getFilteredMaterials = (): LectureMaterial[] => {
    if (selectedDiscipline === null) return materials;
    return materials.filter(
      (m) =>
        m.discipline_ids &&
        Array.isArray(m.discipline_ids) &&
        m.discipline_ids.includes(selectedDiscipline)
    );
  };

  const getUniqueDisciplines = (): Discipline[] => {
    const materialDisciplineIds = [
      ...new Set(materials.flatMap((m) => m.discipline_ids)),
    ];
    return disciplines.filter((d) => materialDisciplineIds.includes(d.id));
  };

  // Function to handle discipline selection in upload form
  const handleUploadDisciplineChange = (disciplineId: number) => {
    setUploadForm((prev) => {
      const newDisciplineIds = prev.discipline_ids.includes(disciplineId)
        ? prev.discipline_ids.filter((id) => id !== disciplineId)
        : [...prev.discipline_ids, disciplineId];

      return {
        ...prev,
        discipline_ids: newDisciplineIds,
      };
    });
  };

  // Function to handle discipline selection in edit form
  const handleEditDisciplineChange = (disciplineId: number) => {
    setEditForm((prev) => {
      const newDisciplineIds = prev.discipline_ids.includes(disciplineId)
        ? prev.discipline_ids.filter((id) => id !== disciplineId)
        : [...prev.discipline_ids, disciplineId];

      return {
        ...prev,
        discipline_ids: newDisciplineIds,
      };
    });
  };

  // Function to get discipline names by IDs
  const getDisciplineNames = (
    disciplineIds: number[] | null | undefined
  ): string => {
    if (!disciplineIds || !Array.isArray(disciplineIds)) {
      return "Без дисциплины";
    }

    return disciplineIds
      .map((id) => {
        const discipline = disciplines.find((d) => d.id === id);
        return discipline ? discipline.name : `ID: ${id}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          paddingTop: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 18 }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        paddingTop: 80,
        padding: "80px 20px 20px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "#e3e3e3",
            padding: "16px 20px",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <span>Учебные материалы</span>

          {/* Discipline filter in header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: 16, fontWeight: 600 }}>Дисциплина:</label>
            <select
              value={selectedDiscipline || ""}
              onChange={(e) =>
                setSelectedDiscipline(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              style={{
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 16,
                minWidth: 200,
                background: "white",
              }}
            >
              <option value="">Все дисциплины</option>
              {getUniqueDisciplines().map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: 12,
              borderRadius: 4,
              marginBottom: 20,
              border: "1px solid #ffcdd2",
            }}
          >
            {error}
          </div>
        )}

        {/* Admin upload button */}
        {store.role === "admin" && (
          <div style={{ marginBottom: 20 }}>
            <button
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => setShowUploadModal(true)}
            >
              Загрузить материал
            </button>
          </div>
        )}

        {/* Display all materials in a simple list */}
        {materials.length > 0 ? (
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                marginBottom: 16,
                color: "#0056a6",
                borderBottom: "2px solid #0056a6",
                paddingBottom: 8,
              }}
            >
              Все материалы
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {getFilteredMaterials().map((material) => (
                <div
                  key={material.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 16,
                    background: "#f9f9f9",
                    cursor: store.role === "admin" ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                  onClick={
                    store.role === "admin"
                      ? () => openEditModal(material)
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (store.role === "admin") {
                      e.currentTarget.style.background = "#f0f8ff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (store.role === "admin") {
                      e.currentTarget.style.background = "#f9f9f9";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 8,
                      color: "#333",
                    }}
                  >
                    {material.title}
                  </h3>

                  {material.description && (
                    <p
                      style={{
                        fontSize: 14,
                        color: "#666",
                        marginBottom: 8,
                      }}
                    >
                      {material.description}
                    </p>
                  )}

                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                      marginBottom: 12,
                    }}
                  >
                    <div>📄 {material.file_name}</div>
                    <div>📊 {formatFileSize(material.size_bytes)}</div>
                    <div>📚 {getDisciplineNames(material.discipline_ids)}</div>
                    <div>
                      📅{" "}
                      {new Date(material.created_at).toLocaleDateString(
                        "ru-RU"
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      style={{
                        background: "#2196f3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "8px 16px",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(material);
                      }}
                    >
                      Скачать
                    </button>

                    {store.role === "admin" && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          fontStyle: "italic",
                          alignSelf: "center",
                          marginLeft: "8px",
                        }}
                      >
                        Нажмите на материал для редактирования
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#666",
              fontSize: 18,
            }}
          >
            Материалы не найдены
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                width: "90%",
                maxWidth: 500,
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 600 }}>
                Загрузить материал
              </h2>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Название *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    fontSize: 16,
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Описание
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    fontSize: 16,
                    minHeight: 80,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Дисциплины * (выберите одну или несколько)
                </label>
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    padding: 12,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {disciplines.map((discipline) => (
                    <div
                      key={discipline.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`upload-discipline-${discipline.id}`}
                        checked={uploadForm.discipline_ids.includes(
                          discipline.id
                        )}
                        onChange={() =>
                          handleUploadDisciplineChange(discipline.id)
                        }
                        style={{ marginRight: 8 }}
                      />
                      <label htmlFor={`upload-discipline-${discipline.id}`}>
                        {discipline.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Файл *
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    fontSize: 16,
                  }}
                />
              </div>

              <div
                style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "#ccc",
                    color: "#333",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      title: "",
                      description: "",
                      discipline_ids: [],
                      file: null,
                    });
                  }}
                >
                  Отмена
                </button>
                <button
                  style={{
                    background: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  onClick={handleUpload}
                >
                  Загрузить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <MyModal visible={showEditModal} setVisible={setShowEditModal}>
          {editingMaterial && (
            <div style={{ width: "90vw", maxWidth: 500 }}>
              <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 600 }}>
                Редактировать материал
              </h2>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Название *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    fontSize: 16,
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Описание
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    fontSize: 16,
                    minHeight: 80,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
                >
                  Дисциплины * (выберите одну или несколько)
                </label>
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    padding: 12,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {disciplines.map((discipline) => (
                    <div
                      key={discipline.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`edit-discipline-${discipline.id}`}
                        checked={editForm.discipline_ids.includes(
                          discipline.id
                        )}
                        onChange={() =>
                          handleEditDisciplineChange(discipline.id)
                        }
                        style={{ marginRight: 8 }}
                      />
                      <label htmlFor={`edit-discipline-${discipline.id}`}>
                        {discipline.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "space-between",
                }}
              >
                <button
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 16px",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (
                      editingMaterial &&
                      confirm("Вы уверены, что хотите удалить этот материал?")
                    ) {
                      handleDelete(editingMaterial.id);
                      setShowEditModal(false);
                      setEditingMaterial(null);
                      setEditForm({
                        title: "",
                        description: "",
                        discipline_ids: [],
                      });
                    }
                  }}
                >
                  Удалить
                </button>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    style={{
                      background: "#ccc",
                      color: "#333",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 16px",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMaterial(null);
                      setEditForm({
                        title: "",
                        description: "",
                        discipline_ids: [],
                      });
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    style={{
                      background: "#2196f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 16px",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      handleEdit();
                    }}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </MyModal>
      </div>
    </div>
  );
};

export default observer(MaterialsPage);
