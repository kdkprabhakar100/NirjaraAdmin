export interface SocialMedia {
  _id: string;

  platform: string;

  platformKey: string;

  accountName: string;

  username: string;

  url: string;

  image: string;

  description: string;

  active: boolean;

  featured: boolean;

  sortOrder: number;

  createdAt?: string;

  updatedAt?: string;
}

/* ============================================================
   CREATE / UPDATE PAYLOAD
============================================================ */

export interface SocialMediaPayload {
  platform: string;

  accountName: string;

  username: string;

  url: string;

  image: string;

  description: string;

  active: boolean;

  featured: boolean;

  sortOrder: number;
}

/* ============================================================
   FILTERS
============================================================ */

export interface SocialMediaFilters {
  search?: string;

  platform?: string;

  active?: string;

  featured?: string;
}