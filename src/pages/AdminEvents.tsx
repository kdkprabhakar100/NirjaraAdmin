import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import getCroppedImg from "../utils/cropImage";

interface EventType {
  _id: string;
  title: string;
  description: string;
  image: string;
 location: string;
  date: string;
  time: string;
  featured: boolean;
  active: boolean;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<EventType[]>([]);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    location: "",
    date: "",
    time: "",
    buttonText: "Register Now",
    buttonLink: "/contact",
  });

  // =============================
  // CROPPER STATES
  // =============================

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<any>(null);

  const [imageSrc, setImageSrc] =
    useState("");

  const [croppedImage, setCroppedImage] =
    useState("");

  // =============================
  // FETCH EVENTS
  // =============================

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events`
      );

      setEvents(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // =============================
  // HANDLE CHANGE
  // =============================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =============================
  // CROP COMPLETE
  // =============================

  const onCropComplete = (
    croppedArea: Area,
    croppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // =============================
  // IMAGE SELECT
  // =============================

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl =
      URL.createObjectURL(file);

    setImageSrc(imageUrl);
  };

  // =============================
  // HANDLE CROP DONE
  // =============================

  const handleCropDone = async () => {
    try {
      const croppedBlob: any =
        await getCroppedImg(
          imageSrc,
          croppedAreaPixels
        );

      if (!croppedBlob) return;

      const data = new FormData();

      data.append("image", croppedBlob);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setFormData({
        ...formData,
        image: res.data.imageUrl,
      });

      setCroppedImage(
        res.data.imageUrl
      );

      setImageSrc("");
    } catch (error) {
      console.log(error);
    }
  };

  // =============================
  // CREATE EVENT
  // =============================

  const createEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`,
        formData
      );

      setFormData({
        title: "",
        description: "",
        image: "",
        location: "",
        date: "",
        time: "",
        buttonText: "Register Now",
        buttonLink: "/contact",
      });

      setCroppedImage("");

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  // =============================
  // EDIT EVENT
  // =============================

  const editEvent = (
    event: EventType
  ) => {
    setEditingId(event._id);

    setFormData({
      title: event.title,
      description: event.description,
      image: event.image,
      location: event.location,
      date:
        event.date.split("T")[0],
      time: event.time,
      buttonText: "Register Now",
      buttonLink: "/contact",
    });

    setCroppedImage(event.image);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =============================
  // UPDATE EVENT
  // =============================

  const updateEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${editingId}`,
        formData
      );

      setEditingId(null);

      setFormData({
        title: "",
        description: "",
        image: "",
        location: "",
        date: "",
        time: "",
        buttonText: "Register Now",
        buttonLink: "/contact",
      });

      setCroppedImage("");

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  // =============================
  // DELETE EVENT
  // =============================

  const deleteEvent = async (
    id: string
  ) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`
      );

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  // =============================
  // TOGGLE FEATURED
  // =============================

  const toggleFeatured = async (
    id: string
  ) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/featured`
      );

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  // =============================
  // TOGGLE ACTIVE
  // =============================

  const toggleActive = async (
    id: string
  ) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/active`
      );

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6 bg-pink-50 min-h-screen">
      {/* TITLE */}

      <h1 className="text-4xl font-bold text-pink-600 mb-8">
        Admin Events
      </h1>

      {/* FORM */}

      <form
        onSubmit={
          editingId
            ? updateEvent
            : createEvent
        }
        className="bg-white rounded-3xl shadow-xl p-6 mb-12 space-y-5"
      >
        {/* TITLE */}

        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-4 rounded-xl"
          required
        />

        {/* DESCRIPTION */}

        <textarea
          name="description"
          placeholder="Event Description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full border p-4 rounded-xl"
          required
        />

        {/* LOCATION */}

        <input
          type="text"
          name="location"
          placeholder="Event Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-4 rounded-xl"
          required
        />

        {/* DATE TIME */}

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-4 rounded-xl"
            required
          />

          <input
            type="text"
            name="time"
            placeholder="2:00 PM"
            value={formData.time}
            onChange={handleChange}
            className="w-full border p-4 rounded-xl"
            required
          />
        </div>

        {/* IMAGE UPLOAD */}

        <div className="space-y-4">
          <input
            type="file"
            onChange={uploadImage}
            className="w-full border p-4 rounded-xl"
          />

          <p className="text-sm text-gray-500">
            Recommended size:
            1200 × 800 px
          </p>

          {/* CROPPER */}

          {imageSrc && (
            <>
              <div className="relative w-full h-[400px] bg-black rounded-2xl overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 2}
                  onCropChange={
                    setCrop
                  }
                  onZoomChange={
                    setZoom
                  }
                  onCropComplete={
                    onCropComplete
                  }
                />
              </div>

              {/* ZOOM */}

              <div>
                <label className="text-sm text-gray-600">
                  Zoom
                </label>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) =>
                    setZoom(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full"
                />
              </div>

              {/* DONE BUTTON */}

              <button
                type="button"
                onClick={
                  handleCropDone
                }
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl"
              >
                Done Cropping
              </button>
            </>
          )}

          {/* PREVIEW */}

          {croppedImage && (
            <img
              src={croppedImage}
              alt=""
              className="w-48 h-32 object-cover rounded-2xl border"
            />
          )}
        </div>

        {/* ACTION BUTTONS */}

        <div className="flex gap-4 flex-wrap">
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl"
          >
            {editingId
              ? "Update Event"
              : "Create Event"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);

                setFormData({
                  title: "",
                  description:
                    "",
                  image: "",
                  location: "",
                  date: "",
                  time: "",
                  buttonText:
                    "Register Now",
                  buttonLink:
                    "/contact",
                });

                setCroppedImage(
                  ""
                );
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* EVENTS GRID */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <motion.div
            key={event._id}
            whileHover={{
              y: -6,
            }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl"
          >
            {/* IMAGE */}

            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />

            {/* CONTENT */}

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-pink-700">
                  {event.title}
                </h2>

                {event.featured && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-600 line-clamp-3 mb-4">
                {event.description}
              </p>

              <div className="text-sm text-gray-500 space-y-1 mb-6">
                <p>
                  📍 {event.location}
                </p>

                <p>
                  📅{" "}
                  {new Date(
                    event.date
                  ).toLocaleDateString()}
                </p>

                <p>
                  ⏰ {event.time}
                </p>
              </div>

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    editEvent(
                      event
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    toggleFeatured(
                      event._id
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-white ${
                    event.featured
                      ? "bg-green-600"
                      : "bg-gray-500"
                  }`}
                >
                  {event.featured
                    ? "Featured"
                    : "Make Featured"}
                </button>

                <button
                  onClick={() =>
                    toggleActive(
                      event._id
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-white ${
                    event.active
                      ? "bg-orange-500"
                      : "bg-gray-500"
                  }`}
                >
                  {event.active
                    ? "Active"
                    : "Inactive"}
                </button>

                <button
                  onClick={() =>
                    deleteEvent(
                      event._id
                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;