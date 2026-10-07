const API_URL =
  import.meta.env
    .VITE_API_URL;

/* ============================================================
   ADMIN UPLOAD
============================================================ */

export async function uploadImage(
  file: File,
  filename?: string
): Promise<string> {
  const token =
    localStorage.getItem(
      "adminToken"
    );

  const formData =
    new FormData();

  formData.append(
    "image",
    file,
    filename ||
      file.name
  );

  const response =
    await fetch(
      `${API_URL}/api/upload`,
      {
        method:
          "POST",

        headers: token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : undefined,

        body:
          formData,
      }
    );

  const data =
    await response
      .json()
      .catch(
        () =>
          ({})
      );

  if (
    !response.ok
  ) {
    throw new Error(
      data?.message ||
        "Image upload failed"
    );
  }

  return data.imageUrl;
}

/* ============================================================
   PUBLIC PAYMENT PROOF UPLOAD
============================================================ */

export async function uploadPaymentProof(
  file: File
): Promise<string> {
  const formData =
    new FormData();

  formData.append(
    "image",
    file,
    file.name
  );

  const response =
    await fetch(
      `${API_URL}/api/upload/payment-proof`,
      {
        method:
          "POST",

        body:
          formData,
      }
    );

  const data =
    await response
      .json()
      .catch(
        () =>
          ({})
      );

  if (
    !response.ok
  ) {
    throw new Error(
      data?.message ||
        "Payment screenshot upload failed"
    );
  }

  return data.imageUrl;
}