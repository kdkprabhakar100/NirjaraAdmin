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

export interface SocialMediaPayload {
  platform: string;

  accountName: string;
  username: string;

  url: string;
  image: string;

  description: string;

  active: boolean;
  featured: boolean;
}