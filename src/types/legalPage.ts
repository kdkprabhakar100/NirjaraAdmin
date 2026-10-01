export type LegalPageSlug =
  | "privacy-policy"
  | "terms";

export type LegalPage = {
  _id: string;
  title: string;
  slug: LegalPageSlug;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateLegalPageInput = {
  title: string;
  content: string;
};