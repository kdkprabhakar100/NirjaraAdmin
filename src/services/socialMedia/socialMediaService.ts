import api from "../base/api";

import type {
  SocialMedia,
  SocialMediaFilters,
  SocialMediaPayload,
} from "./socialMedia.types";

/* ============================================================
   GET ALL — ADMIN
============================================================ */

export async function getSocialMedia(
  filters: SocialMediaFilters = {}
): Promise<SocialMedia[]> {
  const params =
    new URLSearchParams();

  if (
    filters.search?.trim()
  ) {
    params.set(
      "search",
      filters.search.trim()
    );
  }

  if (
    filters.platform?.trim()
  ) {
    params.set(
      "platform",
      filters.platform.trim()
    );
  }

  if (
    filters.active
  ) {
    params.set(
      "active",
      filters.active
    );
  }

  if (
    filters.featured
  ) {
    params.set(
      "featured",
      filters.featured
    );
  }

  const query =
    params.toString();

  const response =
    await api.get<
      SocialMedia[]
    >(
      `/api/social-media/admin/all${
        query
          ? `?${query}`
          : ""
      }`
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
}

/* ============================================================
   GET ONE
============================================================ */

export async function getSocialMediaById(
  id: string
): Promise<SocialMedia> {
  const response =
    await api.get<
      SocialMedia
    >(
      `/api/social-media/admin/${id}`
    );

  return response.data;
}

/* ============================================================
   CREATE
============================================================ */

export async function createSocialMedia(
  payload: SocialMediaPayload
): Promise<SocialMedia> {
  const response =
    await api.post<
      SocialMedia
    >(
      "/api/social-media",
      payload
    );

  return response.data;
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateSocialMedia(
  id: string,

  payload: SocialMediaPayload
): Promise<SocialMedia> {
  const response =
    await api.put<
      SocialMedia
    >(
      `/api/social-media/${id}`,
      payload
    );

  return response.data;
}

/* ============================================================
   TOGGLE ACTIVE
============================================================ */

export async function toggleSocialMedia(
  id: string
): Promise<SocialMedia> {
  const response =
    await api.patch<
      SocialMedia
    >(
      `/api/social-media/${id}/toggle`
    );

  return response.data;
}

/* ============================================================
   TOGGLE FEATURED
============================================================ */

export async function toggleFeaturedSocialMedia(
  id: string
): Promise<SocialMedia> {
  const response =
    await api.patch<
      SocialMedia
    >(
      `/api/social-media/${id}/featured`
    );

  return response.data;
}

/* ============================================================
   DELETE
============================================================ */

export async function deleteSocialMedia(
  id: string
): Promise<void> {
  await api.delete(
    `/api/social-media/${id}`
  );
}