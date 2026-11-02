import api from "../base/api";

import type {
  SocialMedia,
  SocialMediaPayload,
} from "./socialMedia.types";

/* ============================================================
   GET ALL
============================================================ */

export async function getSocialMedia(): Promise<
  SocialMedia[]
> {
  const response =
    await api.get<
      SocialMedia[]
    >(
      "/api/social-media/admin/all"
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
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
   REORDER
============================================================ */

export async function reorderSocialMedia(
  orderedIds: string[]
): Promise<SocialMedia[]> {
  const response =
    await api.patch<
      SocialMedia[]
    >(
      "/api/social-media/reorder",
      {
        orderedIds,
      }
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
}

/* ============================================================
   ACTIVE
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
   FEATURED
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