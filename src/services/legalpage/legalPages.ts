import type {
  LegalPage,
  LegalPageSlug,
  UpdateLegalPageInput,
} from "../../types/legalPage";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export async function getLegalPage(
  slug: LegalPageSlug
): Promise<LegalPage> {
  const response = await fetch(
    `${API_URL}/api/legal-pages/${slug}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load legal page."
    );
  }

  return response.json();
}

export async function updateLegalPage(
  slug: LegalPageSlug,
  data: UpdateLegalPageInput
): Promise<LegalPage> {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/api/legal-pages/${slug}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to update legal page."
    );
  }

  return result;
}