import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CustomTable, {
  type TableColumn,
} from "../../components/CustomTable";

import DialogBox from "../../components/DialogBox";

import RowActionsMenu from "../../components/RowActionsMenu";

import { uploadImage } from "../../services/upload/uploadService";

import FormField from "../../components/FormField";

import api, {
  getApiErrorMessage,
} from "../../services/base/api";

// ========================================
// TYPES
// ========================================

type Course = {
  _id?: string;
  title: string;
  duration: string;
  description: string;
  fee: string;
  certificate: string;
  image?: string;
  // Off: the website shows "Currently not
  // available" and refuses enrollments.
  // Missing on courses saved before the
  // switch existed, which count as on.
  available?: boolean;
};

const emptyCourse: Course = {
  title: "",
  duration: "",
  description: "",
  fee: "",
  certificate: "",
  image: "",
  available: true,
};

const isAvailable = (course: Course) =>
  course.available !== false;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

// ========================================
// SHARED INPUT STYLE
// ========================================

const inputClass =
  "w-full rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 text-sm outline-none focus:border-[#E75480]";

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<
    Course[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState<Course>(emptyCourse);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // The course awaiting delete
  // confirmation. Null means the dialog
  // is closed.
  const [
    courseToDelete,
    setCourseToDelete,
  ] = useState<Course | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  // ============================
  // FETCH COURSES
  // ============================

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses`
      );

      const data = await res.json();

      setCourses(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch courses error:",
        error
      );

      toast.error(
        "Failed to load courses"
      );

      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ============================
  // FORM
  // ============================

  const openAddForm = () => {
    setForm(emptyCourse);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (
    course: Course
  ) => {
    setForm({
      title: course.title || "",
      duration: course.duration || "",
      description:
        course.description || "",
      fee: course.fee || "",
      certificate:
        course.certificate || "",
      image: course.image || "",
      available: isAvailable(course),
    });

    setEditingId(course._id || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyCourse);
    setEditingId(null);
  };

  const handleImageUpload = async (
    file: File
  ) => {
    try {
      setUploading(true);

      const imageUrl =
        await uploadImage(file);

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.image) {
      toast.error(
        "Please upload an image."
      );

      return;
    }

    try {
      setSaving(true);

      await fetch(
        editingId
          ? `${import.meta.env.VITE_API_URL}/api/courses/${editingId}`
          : `${import.meta.env.VITE_API_URL}/api/courses`,
        {
          method: editingId
            ? "PUT"
            : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(form),
        }
      );

      await fetchCourses();

      toast.success(
        editingId
          ? "Course updated successfully!"
          : "Course added successfully!"
      );

      closeForm();
    } catch (error) {
      console.error(
        "Save course error:",
        error
      );

      toast.error(
        "Unable to save the course"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // DELETE
  //
  // Asking happens in the dialog; this
  // only runs once the admin confirms.
  // ============================

  const confirmDelete = async () => {
    if (!courseToDelete?._id) {
      return;
    }

    try {
      setDeleting(true);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      await fetchCourses();

      toast.success(
        "Course deleted successfully!"
      );

      if (
        editingId === courseToDelete._id
      ) {
        closeForm();
      }

      setCourseToDelete(null);
    } catch (error) {
      console.error(
        "Delete course error:",
        error
      );

      toast.error(
        "Unable to delete the course"
      );

      // Dialog stays open so the admin can
      // retry.
    } finally {
      setDeleting(false);
    }
  };

  // ============================
  // AVAILABILITY
  //
  // A quick switch from the table, without
  // opening the form. The row updates in
  // place from the server's answer.
  // ============================

  const toggleAvailability = async (
    course: Course
  ) => {
    if (!course._id) {
      return;
    }

    const next = !isAvailable(course);

    try {
      const { data: updated } =
        await api.put<Course>(
          `/api/courses/${course._id}`,
          { available: next }
        );

      setCourses((previous) =>
        previous.map((one) =>
          one._id === updated._id
            ? updated
            : one
        )
      );

      toast.success(
        next
          ? `"${course.title}" is open for enrollment again.`
          : `"${course.title}" is now shown as not available.`
      );
    } catch (error) {
      console.error(
        "Availability error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to change availability"
        )
      );
    }
  };

  const availabilityBadge = (
    course: Course
  ) =>
    isAvailable(course) ? (
      <span className="inline-block whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Available
      </span>
    ) : (
      <span className="inline-block whitespace-nowrap rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
        Not available
      </span>
    );

  // ============================
  // ROW PIECES
  // ============================

  const thumbnail = (course: Course) =>
    course.image ? (
      <img
        src={course.image}
        alt={course.title}
        className="h-14 w-20 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-soft text-lg text-[#E75480]">
        ✦
      </div>
    );

  const renderActions = (
    course: Course
  ) => (
    <RowActionsMenu
      label={`Actions for ${course.title}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: "✎",
          onSelect: () =>
            openEditForm(course),
        },
        {
          key: "availability",
          label: isAvailable(course)
            ? "Mark not available"
            : "Mark available",
          icon: isAvailable(course)
            ? "⏸"
            : "▶",
          onSelect: () =>
            toggleAvailability(course),
        },
        {
          key: "delete",
          label: "Delete",
          icon: "🗑",
          tone: "danger",
          dividerBefore: true,
          onSelect: () =>
            setCourseToDelete(course),
        },
      ]}
    />
  );

  // ============================
  // COLUMNS
  // ============================

  const columns: TableColumn<Course>[] = [
    {
      key: "image",
      header: "Image",
      width: "110px",
      hideOnMobile: true,
      render: thumbnail,
    },
    {
      key: "title",
      header: "Title",
      hideOnMobile: true,
      cellClassName:
        "font-medium text-ink",
      render: (course) => course.title,
    },
    {
      key: "duration",
      header: "Duration",
      cellClassName: "whitespace-nowrap",
      render: (course) =>
        course.duration,
    },
    {
      key: "fee",
      header: "Fee",
      cellClassName:
        "whitespace-nowrap font-medium text-[#E75480]",
      render: (course) => course.fee,
    },
    {
      key: "enrollment",
      header: "Enrollment",
      render: availabilityBadge,
    },
    {
      key: "certificate",
      header: "Certificate",
      render: (course) =>
        course.certificate,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-sm",
      render: (course) => (
        <p className="line-clamp-2 leading-6">
          {course.description}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "90px",
      hideOnMobile: true,
      render: renderActions,
    },
  ];

  // ============================
  // UI
  // ============================

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[3px] text-[#E75480]">
            Management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#E75480] md:text-5xl">
            Courses
          </h1>

          <p className="mt-2 text-muted">
            Manage academy courses.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-full bg-[#E75480] px-8 py-3 text-xs uppercase tracking-[2px] text-white transition hover:bg-[#d94873]"
        >
          Add Course
        </button>
      </div>

      {/* TABLE */}

      <CustomTable
        className="mt-10"
        columns={columns}
        rows={courses}
        rowKey={(course, index) =>
          course._id ?? String(index)
        }
        loading={loading}
        loadingMessage="Loading courses..."
        emptyIcon="✦"
        emptyTitle="No courses yet"
        emptyMessage="Add your first course using the button above."
        minWidth="1050px"
        mobileTitle={(course) => (
          <span className="flex items-center gap-3">
            {thumbnail(course)}

            <span>{course.title}</span>
          </span>
        )}
        mobileSubtitle={(course) =>
          course.duration
        }
        mobileActions={renderActions}
      />

      {/* ============================ */}
      {/* ADD / EDIT                   */}
      {/* ============================ */}

      <DialogBox
        open={formOpen}
        onClose={closeForm}
        eyebrow="Management"
        title={
          editingId
            ? "Edit Course"
            : "Add New Course"
        }
        size="lg"
        onSubmit={handleSubmit}
        submitting={saving}
        submittingLabel={
          editingId
            ? "Updating..."
            : "Adding..."
        }
        confirmLabel={
          editingId
            ? "Update Course"
            : "Add Course"
        }
        confirmDisabled={uploading}
        // A half filled form should not
        // vanish on a stray click.
        closeOnBackdrop={false}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Course Title"
            required
          >
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Duration"
            required
          >
            <input
              required
              placeholder="e.g. 3 Months"
              value={form.duration}
              onChange={(event) =>
                setForm({
                  ...form,
                  duration:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Fee"
            required
          >
            <input
              required
              placeholder="e.g. Rs. 25,000"
              value={form.fee}
              onChange={(event) =>
                setForm({
                  ...form,
                  fee: event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Certificate"
            required
          >
            <input
              required
              placeholder="e.g. Included"
              value={form.certificate}
              onChange={(event) =>
                setForm({
                  ...form,
                  certificate:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Course Image"
            required
            className="md:col-span-2"
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (!file) {
                  return;
                }

                handleImageUpload(file);
              }}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Description"
            className="md:col-span-2"
          >
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              rows={4}
              className={inputClass}
            />
          </FormField>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E75480]/20 bg-soft px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.available !== false}
              onChange={(event) =>
                setForm({
                  ...form,
                  available:
                    event.target.checked,
                })
              }
              className="mt-1 h-4 w-4 accent-[#E75480]"
            />

            <span>
              <span className="block text-sm font-medium text-ink">
                Available for enrollment
              </span>

              <span className="block text-xs text-muted">
                When off, the website shows
                "Currently not available" on
                this course and students cannot
                enroll in it.
              </span>
            </span>
          </label>
        </div>

        {uploading && (
          <p className="mt-4 text-sm text-muted">
            Uploading image...
          </p>
        )}

        {form.image && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted">
              Image Preview
            </p>

            <img
              src={form.image}
              alt="Preview"
              className="h-44 w-full rounded-2xl object-cover md:max-w-md"
            />
          </div>
        )}
      </DialogBox>

      {/* ============================ */}
      {/* DELETE CONFIRMATION          */}
      {/* ============================ */}

      <DialogBox
        open={Boolean(courseToDelete)}
        onClose={() =>
          setCourseToDelete(null)
        }
        eyebrow="Confirm"
        title="Delete course?"
        description={
          courseToDelete
            ? `"${courseToDelete.title}" will be removed from the website. This cannot be undone.`
            : undefined
        }
        size="sm"
        destructive
        confirmLabel="Delete"
        submittingLabel="Deleting..."
        submitting={deleting}
        onConfirm={confirmDelete}
      >
        <p className="text-sm text-muted">
          Students will no longer see this
          course on the academy page.
        </p>
      </DialogBox>
    </div>
  );
}
