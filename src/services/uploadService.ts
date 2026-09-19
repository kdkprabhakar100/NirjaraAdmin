import axios from "axios";

import api from "./api";

// ========================================
// TYPES
//
// The backend responds with:
//
// { imageUrl: "https://res.cloudinary..." }
// ========================================

export type UploadResponse = {
  imageUrl: string;
};

// ========================================
// ERROR MESSAGE
//
// The API always fails with { message }.
// ========================================

const resolveUploadError = (
  error: unknown
): string => {
  if (
    axios.isAxiosError<{
      message?: string;
    }>(error)
  ) {
    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    return (
      error.response?.data?.message ||
      "Image upload failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Image upload failed.";
};

// ========================================
// UPLOAD IMAGE
//
// POST /api/upload
// Admin only — multipart/form-data with
// an "image" field.
//
// Two things matter here:
//
// 1. We go through the shared `api`
//    instance so the admin bearer token
//    is attached by the interceptor.
//
// 2. We never set Content-Type ourselves.
//    The browser has to add the multipart
//    boundary, and hardcoding the header
//    strips it.
// ========================================

export const uploadImage = async (
  file: File | Blob,
  fileName = "image.png"
): Promise<string> => {
  const formData = new FormData();

  formData.append(
    "image",
    file,
    file instanceof File
      ? file.name
      : fileName
  );

  try {
    const response =
      await api.post<UploadResponse>(
        "/api/upload",
        formData
      );

    if (!response.data?.imageUrl) {
      throw new Error(
        "The server did not return an image URL."
      );
    }

    return response.data.imageUrl;
  } catch (error) {
    throw new Error(
      resolveUploadError(error)
    );
  }
};
