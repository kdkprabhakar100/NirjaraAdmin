import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  uploadImage as uploadImageToServer,
} from "../../services/upload/uploadService";

/* ============================================================
   TYPES
============================================================ */

type SocialLinks = {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
};

type PaymentSettings = {
  qrImage: string;
  accountName: string;
  instructions: string;
};

type ShippingOption = {
  key: string;
  label: string;
  price: number;
  enabled: boolean;
  freeShipping: boolean;
  freeShippingNote: string;
};

type ShippingSettings = {
  options: ShippingOption[];
};

type FooterSettings = {
  showSocialLinks: boolean;
  showAdminLogin: boolean;
  showBookAppointment: boolean;
  showBranches: boolean;

  copyrightText: string;
  developerName: string;
  developerUrl: string;

  privacyPolicyUrl: string;
  termsUrl: string;
};

type SiteSettings = {
  salonName: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;

  socialLinks: SocialLinks;

  payment: PaymentSettings;

  shipping: ShippingSettings;

  footer: FooterSettings;
};

type TabId =
  | "business"
  | "social"
  | "payment"
  | "footer"
  | "email";

/* ============================================================
   TABS
============================================================ */

const TABS: {
  id: TabId;
  label: string;
}[] = [
  {
    id: "business",
    label: "Business",
  },
  {
    id: "social",
    label: "Social Media",
  },
  {
    id: "payment",
    label: "Payment",
  },
  {
    id: "footer",
    label: "Footer",
  },
  {
    id: "email",
    label: "Email",
  },
];

/* ============================================================
   INITIAL SETTINGS
============================================================ */

const initialSettings: SiteSettings = {
  salonName: "Nirjara Beauty",

  description:
    "A professional beauty salon and academy offering salon services, beauty training, and customer-focused care in Kathmandu.",

  email: "",

  phone: "",

  whatsapp: "",

  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },

  payment: {
    qrImage: "",

    accountName: "",

    instructions:
      "Scan the QR code, complete your payment, and upload a screenshot of the payment confirmation.",
  },

  shipping: {
    options: [],
  },

  footer: {
    showSocialLinks: true,

    showAdminLogin: true,

    showBookAppointment: true,

    showBranches: true,

    copyrightText:
      "© 2026 Nirjara Beauty. All rights reserved.",

    developerName:
      "Prabhakar Khadka",

    developerUrl: "",

    privacyPolicyUrl:
      "/privacy-policy",

    termsUrl:
      "/terms",
  },
};

/* ============================================================
   ADMIN SETTINGS
============================================================ */

export default function AdminSettings() {
  const [
    settings,
    setSettings,
  ] =
    useState<SiteSettings>(
      initialSettings
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabId>(
      "business"
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    uploadingQr,
    setUploadingQr,
  ] =
    useState(false);

  const [
    newShippingLabel,
    setNewShippingLabel,
  ] =
    useState("");

  const [
    newShippingPrice,
    setNewShippingPrice,
  ] =
    useState("");

  const [
    addingShipping,
    setAddingShipping,
  ] =
    useState(false);

  const [
    shippingActionKey,
    setShippingActionKey,
  ] =
    useState<string | null>(
      null
    );

  const [
    editingShippingKey,
    setEditingShippingKey,
  ] =
    useState<string | null>(
      null
    );

  const [
    shippingDraft,
    setShippingDraft,
  ] =
    useState<ShippingOption | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    testEmailTo,
    setTestEmailTo,
  ] =
    useState("");

  const [
    sendingTest,
    setSendingTest,
  ] =
    useState(false);

  const [
    testResult,
    setTestResult,
  ] =
    useState<{
      ok: boolean;
      message: string;
    } | null>(
      null
    );

  const qrInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const API_URL =
    import.meta.env
      .VITE_API_URL;

  /* ============================================================
     FETCH SETTINGS
  ============================================================ */

  useEffect(
    () => {
      const fetchSettings =
        async () => {
          try {
            setLoading(
              true
            );

            const response =
              await fetch(
                `${API_URL}/api/site-settings`
              );

            if (
              !response.ok
            ) {
              throw new Error(
                "Could not load site settings."
              );
            }

            const data =
              await response.json();

            const shippingOptions:
              ShippingOption[] =
              Array.isArray(
                data.shipping
                  ?.options
              )
                ? data.shipping.options.map(
                    (
                      option: ShippingOption
                    ) => ({
                      key:
                        option.key,

                      label:
                        option.label,

                      price:
                        Number(
                          option.price ??
                            0
                        ),

                      enabled:
                        option.enabled !==
                        false,

                      freeShipping:
                        option.freeShipping ===
                        true,

                      freeShippingNote:
                        option.freeShippingNote ??
                        "",
                    })
                  )
                : [];

            setSettings({
              salonName:
                data.salonName ??
                initialSettings.salonName,

              description:
                data.description ??
                initialSettings.description,

              email:
                data.email ??
                "",

              phone:
                data.phone ??
                "",

              whatsapp:
                data.whatsapp ??
                "",

              socialLinks: {
                facebook:
                  data.socialLinks
                    ?.facebook ??
                  "",

                instagram:
                  data.socialLinks
                    ?.instagram ??
                  "",

                tiktok:
                  data.socialLinks
                    ?.tiktok ??
                  "",

                youtube:
                  data.socialLinks
                    ?.youtube ??
                  "",
              },

              payment: {
                qrImage:
                  data.payment
                    ?.qrImage ??
                  "",

                accountName:
                  data.payment
                    ?.accountName ??
                  "",

                instructions:
                  data.payment
                    ?.instructions ??
                  initialSettings
                    .payment
                    .instructions,
              },

              shipping: {
                options:
                  shippingOptions,
              },

              footer: {
                showSocialLinks:
                  data.footer
                    ?.showSocialLinks ??
                  true,

                showAdminLogin:
                  data.footer
                    ?.showAdminLogin ??
                  true,

                showBookAppointment:
                  data.footer
                    ?.showBookAppointment ??
                  true,

                showBranches:
                  data.footer
                    ?.showBranches ??
                  true,

                copyrightText:
                  data.footer
                    ?.copyrightText ??
                  initialSettings
                    .footer
                    .copyrightText,

                developerName:
                  data.footer
                    ?.developerName ??
                  initialSettings
                    .footer
                    .developerName,

                developerUrl:
                  data.footer
                    ?.developerUrl ??
                  "",

                privacyPolicyUrl:
                  data.footer
                    ?.privacyPolicyUrl ??
                  "/privacy-policy",

                termsUrl:
                  data.footer
                    ?.termsUrl ??
                  "/terms",
              },
            });
          } catch (
            error
          ) {
            console.error(
              "LOAD SETTINGS ERROR:",
              error
            );

            toast.error(
              "Could not load site settings."
            );
          } finally {
            setLoading(
              false
            );
          }
        };

      fetchSettings();
    },
    [
      API_URL,
    ]
  );

  /* ============================================================
     BUSINESS
  ============================================================ */

  const updateField = (
    field:
      | "salonName"
      | "description"
      | "email"
      | "phone"
      | "whatsapp",

    value: string
  ) => {
    setSettings(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );

    setMessage(
      ""
    );
  };

  /* ============================================================
     SOCIAL
  ============================================================ */

  const updateSocial = (
    network:
      keyof SocialLinks,

    value: string
  ) => {
    setSettings(
      (
        previous
      ) => ({
        ...previous,

        socialLinks: {
          ...previous.socialLinks,

          [network]:
            value,
        },
      })
    );

    setMessage(
      ""
    );
  };

  /* ============================================================
     PAYMENT
  ============================================================ */

  const updatePayment = (
    field:
      keyof PaymentSettings,

    value: string
  ) => {
    setSettings(
      (
        previous
      ) => ({
        ...previous,

        payment: {
          ...previous.payment,

          [field]:
            value,
        },
      })
    );

    setMessage(
      ""
    );
  };

  /* ============================================================
     SHIPPING CRUD
  ============================================================ */

  const getAuthHeaders =
    () => {
      const token =
        localStorage.getItem(
          "adminToken"
        );

      return {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      };
    };

  const beginEditShipping = (
    option: ShippingOption
  ) => {
    setEditingShippingKey(
      option.key
    );

    setShippingDraft({
      ...option,
    });

    setMessage(
      ""
    );
  };

  const cancelEditShipping =
    () => {
      setEditingShippingKey(
        null
      );

      setShippingDraft(
        null
      );
    };

  const updateShippingDraft = (
    field:
      | "label"
      | "price"
      | "enabled"
      | "freeShipping"
      | "freeShippingNote",

    value:
      | string
      | number
      | boolean
  ) => {
    setShippingDraft(
      (
        previous
      ) =>
        previous
          ? {
              ...previous,

              [field]:
                value,
            }
          : previous
    );

    setMessage(
      ""
    );
  };

  const addShippingOption =
    async () => {
      const label =
        newShippingLabel.trim();

      const price =
        Number(
          newShippingPrice
        );

      if (
        !label
      ) {
        toast.error(
          "Enter a shipping region name."
        );

        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <=
          0
      ) {
        toast.error(
          "Shipping fee must be greater than Rs. 0."
        );

        return;
      }

      if (
        settings.shipping.options.length >=
        20
      ) {
        toast.error(
          "Maximum 20 shipping regions are allowed."
        );

        return;
      }

      try {
        setAddingShipping(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/site-settings/shipping`,

            {
              method:
                "POST",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({
                  label,
                  price,
                  enabled:
                    true,
                  freeShipping:
                    false,
                  freeShippingNote:
                    "",
                }),
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
              "Could not add shipping region."
          );
        }

        setSettings(
          (
            previous
          ) => ({
            ...previous,

            shipping: {
              ...previous.shipping,

              options: [
                ...previous.shipping.options,

                {
                  key:
                    data.key,

                  label:
                    data.label,

                  price:
                    Number(
                      data.price ??
                        0
                    ),

                  enabled:
                    data.enabled !==
                    false,

                  freeShipping:
                    data.freeShipping ===
                    true,

                  freeShippingNote:
                    data.freeShippingNote ??
                    "",
                },
              ],
            },
          })
        );

        setNewShippingLabel(
          ""
        );

        setNewShippingPrice(
          ""
        );

        toast.success(
          "Shipping region added."
        );
      } catch (
        error
      ) {
        console.error(
          "ADD SHIPPING ERROR:",
          error
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Could not add shipping region."
        );
      } finally {
        setAddingShipping(
          false
        );
      }
    };

  const saveShippingOption =
    async () => {
      if (
        !shippingDraft
      ) {
        return;
      }

      const option =
        shippingDraft;

      const label =
        option.label.trim();

      const price =
        Number(
          option.price
        );

      if (
        !label
      ) {
        toast.error(
          "Shipping region name is required."
        );

        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <
          0
      ) {
        toast.error(
          "Shipping fee cannot be negative."
        );

        return;
      }

      if (
        option.enabled &&
        !option.freeShipping &&
        price <=
          0
      ) {
        toast.error(
          `Enter a shipping fee for ${label}, or enable Free Shipping.`
        );

        return;
      }

      try {
        setShippingActionKey(
          option.key
        );

        const response =
          await fetch(
            `${API_URL}/api/site-settings/shipping/${encodeURIComponent(
              option.key
            )}`,

            {
              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({
                  label,

                  price,

                  enabled:
                    option.enabled,

                  freeShipping:
                    option.freeShipping,

                  freeShippingNote:
                    option.freeShippingNote.trim(),
                }),
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
              "Could not update shipping region."
          );
        }

        const savedOption:
          ShippingOption = {
          key:
            data.key ??
            option.key,

          label:
            data.label ??
            label,

          price:
            Number(
              data.price ??
                price
            ),

          enabled:
            data.enabled !==
            false,

          freeShipping:
            data.freeShipping ===
            true,

          freeShippingNote:
            data.freeShippingNote ??
            "",
        };

        setSettings(
          (
            previous
          ) => ({
            ...previous,

            shipping: {
              ...previous.shipping,

              options:
                previous.shipping.options.map(
                  (
                    current
                  ) =>
                    current.key ===
                    option.key
                      ? savedOption
                      : current
                ),
            },
          })
        );

        setEditingShippingKey(
          null
        );

        setShippingDraft(
          null
        );

        toast.success(
          `${savedOption.label} updated.`
        );
      } catch (
        error
      ) {
        console.error(
          "UPDATE SHIPPING ERROR:",
          error
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Could not update shipping region."
        );
      } finally {
        setShippingActionKey(
          null
        );
      }
    };

  const deleteShippingOption =
    async (
      option:
        ShippingOption
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${option.label}" shipping region?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setShippingActionKey(
          option.key
        );

        const response =
          await fetch(
            `${API_URL}/api/site-settings/shipping/${encodeURIComponent(
              option.key
            )}`,

            {
              method:
                "DELETE",

              headers:
                getAuthHeaders(),
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
              "Could not delete shipping region."
          );
        }

        setSettings(
          (
            previous
          ) => ({
            ...previous,

            shipping: {
              ...previous.shipping,

              options:
                previous.shipping.options.filter(
                  (
                    current
                  ) =>
                    current.key !==
                    option.key
                ),
            },
          })
        );

        if (
          editingShippingKey ===
          option.key
        ) {
          setEditingShippingKey(
            null
          );

          setShippingDraft(
            null
          );
        }

        toast.success(
          "Shipping region deleted."
        );
      } catch (
        error
      ) {
        console.error(
          "DELETE SHIPPING ERROR:",
          error
        );

        toast.error(
          error instanceof
            Error
            ? error.message
            : "Could not delete shipping region."
        );
      } finally {
        setShippingActionKey(
          null
        );
      }
    };

  /* ============================================================
     QR UPLOAD
  ============================================================ */

  const handleQrUpload =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (
        !file
      ) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        toast.error(
          "Please select an image file."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        5 *
          1024 *
          1024
      ) {
        toast.error(
          "QR image must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      try {
        setUploadingQr(
          true
        );

        const imageUrl =
          await uploadImageToServer(
            file,
            "payment-qr.jpg"
          );

        updatePayment(
          "qrImage",
          imageUrl
        );

        toast.success(
          "QR uploaded. Click Save Settings to publish it."
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        toast.error(
          "Unable to upload QR image."
        );
      } finally {
        setUploadingQr(
          false
        );

        event.target.value =
          "";
      }
    };

  const removeQr =
    () => {
      updatePayment(
        "qrImage",
        ""
      );

      toast.info(
        "QR removed. Click Save Settings to apply."
      );
    };

  /* ============================================================
     FOOTER
  ============================================================ */

  const updateFooterText = (
    field:
      | "copyrightText"
      | "developerName"
      | "developerUrl"
      | "privacyPolicyUrl"
      | "termsUrl",

    value: string
  ) => {
    setSettings(
      (
        previous
      ) => ({
        ...previous,

        footer: {
          ...previous.footer,

          [field]:
            value,
        },
      })
    );

    setMessage(
      ""
    );
  };

  const updateFooterSwitch = (
    field:
      | "showSocialLinks"
      | "showAdminLogin"
      | "showBookAppointment"
      | "showBranches"
  ) => {
    setSettings(
      (
        previous
      ) => ({
        ...previous,

        footer: {
          ...previous.footer,

          [field]:
            !previous.footer[
              field
            ],
        },
      })
    );

    setMessage(
      ""
    );
  };

  /* ============================================================
     SAVE SETTINGS

     Shipping is saved independently through CRUD endpoints.
  ============================================================ */

  const handleSave =
    async () => {
      try {
        setSaving(
          true
        );

        setMessage(
          ""
        );

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const payload = {
          salonName:
            settings.salonName,

          description:
            settings.description,

          email:
            settings.email,

          phone:
            settings.phone,

          whatsapp:
            settings.whatsapp,

          socialLinks:
            settings.socialLinks,

          payment:
            settings.payment,

          footer:
            settings.footer,
        };

        const response =
          await fetch(
            `${API_URL}/api/site-settings`,

            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body:
                JSON.stringify(
                  payload
                ),
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
              "Could not save settings."
          );
        }

        setSettings(
          (
            previous
          ) => ({
            ...previous,

            salonName:
              data.salonName ??
              previous.salonName,

            description:
              data.description ??
              previous.description,

            email:
              data.email ??
              previous.email,

            phone:
              data.phone ??
              previous.phone,

            whatsapp:
              data.whatsapp ??
              previous.whatsapp,

            socialLinks: {
              ...previous.socialLinks,
              ...(data.socialLinks ??
                {}),
            },

            payment: {
              ...previous.payment,
              ...(data.payment ??
                {}),
            },

            footer: {
              ...previous.footer,
              ...(data.footer ??
                {}),
            },
          })
        );

        setMessage(
          "Settings saved successfully."
        );

        toast.success(
          "Settings saved successfully."
        );
      } catch (
        error
      ) {
        console.error(
          "SAVE SETTINGS ERROR:",
          error
        );

        const errorMessage =
          error instanceof
          Error
            ? error.message
            : "Could not save settings.";

        setMessage(
          errorMessage
        );

        toast.error(
          errorMessage
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================================================
     TEST EMAIL
  ============================================================ */

  const sendTestEmail =
    async () => {
      const to =
        testEmailTo.trim() ||
        settings.email;

      if (
        !to
      ) {
        setTestResult({
          ok:
            false,

          message:
            "Enter an email address.",
        });

        return;
      }

      try {
        setSendingTest(
          true
        );

        setTestResult(
          null
        );

        const token =
          localStorage.getItem(
            "adminToken"
          );

        const response =
          await fetch(
            `${API_URL}/api/site-settings/test-email`,

            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body:
                JSON.stringify({
                  to,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () =>
                ({})
            );

        setTestResult({
          ok:
            response.ok,

          message:
            data.message ??
            (
              response.ok
                ? "Test email sent."
                : "Unable to send test email."
            ),
        });
      } catch (
        error
      ) {
        console.error(
          error
        );

        setTestResult({
          ok:
            false,

          message:
            "Unable to reach the server.",
        });
      } finally {
        setSendingTest(
          false
        );
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <div
        className="
          flex
          min-h-[500px]
          items-center
          justify-center
        "
      >
        <p className="text-sm text-muted">
          Loading settings...
        </p>
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div
      className="
        min-h-screen
        bg-soft
        p-5
        pb-32

        sm:p-7
        sm:pb-32

        lg:p-8
        lg:pb-32
      "
    >
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[4px]
              text-[#E75480]
            "
          >
            Website
          </p>

          <h1
            className="
              mt-2
              font-serif
              text-4xl
              text-ink

              sm:text-5xl
            "
          >
            Site Settings
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-muted
            "
          >
            Manage business information,
            payment settings, shipping,
            social media and footer settings.
          </p>
        </div>

        {/* TABS */}

        <div
          className="
            mt-8
            flex
            gap-2
            overflow-x-auto
            rounded-full
            border
            border-[#E75480]/10
            bg-surface
            p-1.5
            shadow-sm
          "
        >
          {TABS.map(
            (
              tab
            ) => {
              const active =
                activeTab ===
                tab.id;

              return (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`
                    shrink-0
                    rounded-full
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[2px]
                    transition

                    ${
                      active
                        ? "bg-[#E75480] text-white shadow-sm"
                        : "text-muted hover:bg-blush hover:text-ink"
                    }
                  `}
                >
                  {
                    tab.label
                  }
                </button>
              );
            }
          )}
        </div>

        <div className="mt-6 space-y-6">

          {/* ==================================================
              BUSINESS
          ================================================== */}

          {activeTab ===
            "business" && (
            <SettingsCard
              title="Business Information"
              description="General contact information used across the website."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Salon Name"
                  value={
                    settings.salonName
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "salonName",
                      value
                    )
                  }
                />

                <Input
                  label="Email"
                  type="email"
                  value={
                    settings.email
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "email",
                      value
                    )
                  }
                />

                <Input
                  label="Phone"
                  value={
                    settings.phone
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "phone",
                      value
                    )
                  }
                />

                <Input
                  label="WhatsApp"
                  value={
                    settings.whatsapp
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "whatsapp",
                      value
                    )
                  }
                />
              </div>

              <div className="mt-4">
                <FieldLabel>
                  Description
                </FieldLabel>

                <textarea
                  rows={
                    4
                  }
                  value={
                    settings.description
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "description",
                      event.target
                        .value
                    )
                  }
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[#E75480]/15
                    bg-softer
                    px-5
                    py-4
                    text-sm
                    text-ink
                    outline-none

                    focus:border-[#E75480]/50
                    focus:bg-white
                  "
                />
              </div>
            </SettingsCard>
          )}

          {/* ==================================================
              SOCIAL
          ================================================== */}

          {activeTab ===
            "social" && (
            <SettingsCard
              title="Social Media"
              description="Manage your social media links."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Facebook"
                  value={
                    settings
                      .socialLinks
                      .facebook
                  }
                  onChange={(
                    value
                  ) =>
                    updateSocial(
                      "facebook",
                      value
                    )
                  }
                />

                <Input
                  label="Instagram"
                  value={
                    settings
                      .socialLinks
                      .instagram
                  }
                  onChange={(
                    value
                  ) =>
                    updateSocial(
                      "instagram",
                      value
                    )
                  }
                />

                <Input
                  label="TikTok"
                  value={
                    settings
                      .socialLinks
                      .tiktok
                  }
                  onChange={(
                    value
                  ) =>
                    updateSocial(
                      "tiktok",
                      value
                    )
                  }
                />

                <Input
                  label="YouTube"
                  value={
                    settings
                      .socialLinks
                      .youtube
                  }
                  onChange={(
                    value
                  ) =>
                    updateSocial(
                      "youtube",
                      value
                    )
                  }
                />
              </div>
            </SettingsCard>
          )}

          {/* ==================================================
              PAYMENT
          ================================================== */}

          {activeTab ===
            "payment" && (
            <div className="space-y-6">

              {/* PAYMENT QR */}

              <SettingsCard
                title="Online Payment"
                description="Configure the QR customers use during checkout."
              >
                <div
                  className="
                    grid
                    gap-7

                    lg:grid-cols-[300px_1fr]
                  "
                >
                  <div>
                    <FieldLabel>
                      Payment QR
                    </FieldLabel>

                    <div
                      className="
                        flex
                        min-h-[280px]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-dashed
                        border-[#E75480]/25
                        bg-softer
                        p-5
                      "
                    >
                      {settings
                        .payment
                        .qrImage ? (
                        <img
                          src={
                            settings
                              .payment
                              .qrImage
                          }
                          alt="Payment QR"
                          className="
                            max-h-[240px]
                            max-w-full
                            rounded-2xl
                            bg-white
                            object-contain
                            p-2
                          "
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-sm font-medium text-ink">
                            No QR uploaded
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            Upload your payment QR.
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={
                        qrInputRef
                      }
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleQrUpload
                      }
                    />

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={
                          uploadingQr
                        }
                        onClick={() =>
                          qrInputRef.current?.click()
                        }
                        className="
                          rounded-full
                          bg-[#E75480]
                          px-5
                          py-2.5
                          text-xs
                          font-semibold
                          text-white
                        "
                      >
                        {uploadingQr
                          ? "Uploading..."
                          : settings
                                .payment
                                .qrImage
                            ? "Change QR"
                            : "Upload QR"}
                      </button>

                      {settings
                        .payment
                        .qrImage && (
                        <button
                          type="button"
                          onClick={
                            removeQr
                          }
                          className="
                            rounded-full
                            border
                            border-[#E75480]/30
                            px-5
                            py-2.5
                            text-xs
                            font-semibold
                            text-[#E75480]
                          "
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Payment Account Name"
                      value={
                        settings
                          .payment
                          .accountName
                      }
                      placeholder="Nirjara Beauty"
                      onChange={(
                        value
                      ) =>
                        updatePayment(
                          "accountName",
                          value
                        )
                      }
                    />

                    <div>
                      <FieldLabel>
                        Payment Instructions
                      </FieldLabel>

                      <textarea
                        rows={
                          5
                        }
                        value={
                          settings
                            .payment
                            .instructions
                        }
                        onChange={(
                          event
                        ) =>
                          updatePayment(
                            "instructions",
                            event.target
                              .value
                          )
                        }
                        className="
                          w-full
                          resize-none
                          rounded-2xl
                          border
                          border-[#E75480]/15
                          bg-softer
                          px-5
                          py-4
                          text-sm
                          leading-6
                          text-ink
                          outline-none

                          focus:border-[#E75480]/50
                          focus:bg-white
                        "
                      />
                    </div>
                  </div>
                </div>
              </SettingsCard>

              {/* ==================================================
                  SHIPPING CRUD
              ================================================== */}

              <SettingsCard
                title="Shipping Rates"
                description="Create and manage delivery regions, prices, availability and free-shipping promotions."
              >
                {/* ADD REGION */}

                <div
                  className="
                    rounded-[24px]
                    border
                    border-dashed
                    border-[#E75480]/25
                    bg-[#FFF8FA]
                    p-5

                    sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-2

                      sm:flex-row
                      sm:items-end
                      sm:justify-between
                    "
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                        New Region
                      </p>

                      <h3 className="mt-1 font-serif text-xl text-ink">
                        Add Shipping Region
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-muted">
                        Add any local or international delivery area.
                      </p>
                    </div>

                    <p className="text-xs text-muted">
                      {settings.shipping.options.length}
                      /20 regions
                    </p>
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      gap-4

                      md:grid-cols-[1fr_220px_auto]
                      md:items-end
                    "
                  >
                    <div>
                      <FieldLabel>
                        Region Name
                      </FieldLabel>

                      <input
                        type="text"
                        value={
                          newShippingLabel
                        }
                        placeholder="e.g. Pokhara"
                        maxLength={
                          150
                        }
                        onChange={(
                          event
                        ) =>
                          setNewShippingLabel(
                            event.target.value
                          )
                        }
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[#E75480]/15
                          bg-white
                          px-4
                          text-sm
                          text-ink
                          outline-none

                          focus:border-[#E75480]/50
                        "
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Shipping Fee
                      </FieldLabel>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                          Rs.
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            newShippingPrice
                          }
                          placeholder="150"
                          onChange={(
                            event
                          ) =>
                            setNewShippingPrice(
                              event.target.value
                            )
                          }
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-[#E75480]/15
                            bg-white
                            pl-12
                            pr-4
                            text-sm
                            text-ink
                            outline-none

                            focus:border-[#E75480]/50
                          "
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        addingShipping ||
                        settings.shipping.options.length >=
                          20
                      }
                      onClick={
                        addShippingOption
                      }
                      className="
                        h-12
                        rounded-full
                        bg-[#E75480]
                        px-7
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[1.5px]
                        text-white
                        transition

                        hover:bg-[#D94873]

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {addingShipping
                        ? "Adding..."
                        : "+ Add Region"}
                    </button>
                  </div>
                </div>

                {settings.shipping.options.length ===
                  0 && (
                  <div className="mt-5 rounded-[24px] border border-[#E75480]/10 bg-white p-8 text-center">
                    <p className="font-serif text-xl text-ink">
                      No shipping regions yet
                    </p>

                    <p className="mt-2 text-sm text-muted">
                      Add your first shipping region above.
                    </p>
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  {settings.shipping.options.map(
                    (
                      option
                    ) => {
                      const busy =
                        shippingActionKey ===
                        option.key;

                      const editing =
                        editingShippingKey ===
                          option.key &&
                        shippingDraft?.key ===
                          option.key;

                      const displayOption =
                        editing &&
                        shippingDraft
                          ? shippingDraft
                          : option;

                      return (
                        <div
                          key={
                            option.key
                          }
                          className="
                            rounded-[24px]
                            border
                            border-[#E75480]/10
                            bg-[#FFF8FA]
                            p-5

                            sm:p-6
                          "
                        >
                          {!editing ? (
                            <>
                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-4

                                  sm:flex-row
                                  sm:items-start
                                  sm:justify-between
                                "
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-serif text-xl text-ink">
                                      {option.label}
                                    </h3>

                                    <span
                                      className={`
                                        rounded-full
                                        px-3
                                        py-1
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[1px]

                                        ${
                                          option.enabled
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                        }
                                      `}
                                    >
                                      {option.enabled
                                        ? "Enabled"
                                        : "Disabled"}
                                    </span>

                                    {option.enabled &&
                                      option.freeShipping && (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-[9px] font-semibold uppercase tracking-[1px] text-green-700">
                                          Free Shipping
                                        </span>
                                      )}
                                  </div>

                                  <p className="mt-2 text-[10px] text-muted">
                                    ID: {option.key}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      busy ||
                                      editingShippingKey !==
                                        null
                                    }
                                    onClick={() =>
                                      beginEditShipping(
                                        option
                                      )
                                    }
                                    className="
                                      rounded-full
                                      border
                                      border-[#E75480]/25
                                      bg-white
                                      px-5
                                      py-2.5
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-[1px]
                                      text-[#E75480]
                                      transition

                                      hover:bg-[#FFF0F5]

                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      busy ||
                                      editingShippingKey !==
                                        null
                                    }
                                    onClick={() =>
                                      deleteShippingOption(
                                        option
                                      )
                                    }
                                    className="
                                      rounded-full
                                      border
                                      border-red-200
                                      bg-white
                                      px-5
                                      py-2.5
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-[1px]
                                      text-red-600
                                      transition

                                      hover:bg-red-50

                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#E75480]/10 bg-white p-4">
                                  <p className="text-[9px] font-semibold uppercase tracking-[2px] text-muted">
                                    Normal Shipping Fee
                                  </p>

                                  <p className="mt-2 font-serif text-xl text-ink">
                                    Rs.{" "}
                                    {Number(
                                      option.price
                                    ).toLocaleString()}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-[#E75480]/10 bg-white p-4">
                                  <p className="text-[9px] font-semibold uppercase tracking-[2px] text-muted">
                                    Checkout Charge
                                  </p>

                                  <div className="mt-2">
                                    {!option.enabled ? (
                                      <p className="text-sm font-medium text-gray-500">
                                        Not available at checkout
                                      </p>
                                    ) : option.freeShipping ? (
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
                                          FREE
                                        </span>

                                        {option.price >
                                          0 && (
                                          <span className="text-xs text-muted line-through">
                                            Rs.{" "}
                                            {Number(
                                              option.price
                                            ).toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="font-serif text-xl text-[#E75480]">
                                        Rs.{" "}
                                        {Number(
                                          option.price
                                        ).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {option.enabled &&
                                option.freeShipping &&
                                option.freeShippingNote && (
                                  <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-[1.5px] text-green-700">
                                      Free Shipping Note
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-green-700/80">
                                      {option.freeShippingNote}
                                    </p>
                                  </div>
                                )}
                            </>
                          ) : (
                            <>
                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-4

                                  sm:flex-row
                                  sm:items-start
                                  sm:justify-between
                                "
                              >
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#E75480]">
                                    Editing Region
                                  </p>

                                  <h3 className="mt-1 font-serif text-xl text-ink">
                                    {displayOption.label ||
                                      "Shipping Region"}
                                  </h3>

                                  <p className="mt-1 text-[10px] text-muted">
                                    ID: {option.key}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={
                                    cancelEditShipping
                                  }
                                  className="
                                    w-fit
                                    rounded-full
                                    border
                                    border-[#E75480]/20
                                    bg-white
                                    px-5
                                    py-2.5
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[1px]
                                    text-muted

                                    hover:bg-[#FFF5F8]

                                    disabled:opacity-50
                                  "
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="mt-5">
                                <FieldLabel>
                                  Region Name
                                </FieldLabel>

                                <input
                                  type="text"
                                  value={
                                    displayOption.label
                                  }
                                  disabled={
                                    busy
                                  }
                                  maxLength={
                                    150
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateShippingDraft(
                                      "label",
                                      event.target.value
                                    )
                                  }
                                  className="
                                    h-12
                                    w-full
                                    rounded-2xl
                                    border
                                    border-[#E75480]/15
                                    bg-white
                                    px-4
                                    font-serif
                                    text-lg
                                    text-ink
                                    outline-none

                                    focus:border-[#E75480]/50

                                    disabled:opacity-60
                                  "
                                />
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                  <FieldLabel>
                                    Normal Shipping Fee
                                  </FieldLabel>

                                  <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                                      Rs.
                                    </span>

                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      disabled={
                                        busy
                                      }
                                      value={
                                        displayOption.price
                                      }
                                      onChange={(
                                        event
                                      ) => {
                                        const raw =
                                          event.target.value;

                                        const parsed =
                                          raw ===
                                          ""
                                            ? 0
                                            : Number(
                                                raw
                                              );

                                        updateShippingDraft(
                                          "price",
                                          Number.isFinite(
                                            parsed
                                          )
                                            ? Math.max(
                                                0,
                                                parsed
                                              )
                                            : 0
                                        );
                                      }}
                                      className="
                                        h-12
                                        w-full
                                        rounded-2xl
                                        border
                                        border-[#E75480]/15
                                        bg-white
                                        pl-12
                                        pr-4
                                        text-sm
                                        text-ink
                                        outline-none

                                        focus:border-[#E75480]/50

                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                      "
                                    />
                                  </div>

                                  <p className="mt-2 text-[11px] leading-5 text-muted">
                                    Keep the normal fee even when
                                    free shipping is temporarily active.
                                  </p>
                                </div>

                                <div>
                                  <FieldLabel>
                                    Region Availability
                                  </FieldLabel>

                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      updateShippingDraft(
                                        "enabled",
                                        !displayOption.enabled
                                      )
                                    }
                                    className={`
                                      flex
                                      h-12
                                      w-full
                                      items-center
                                      justify-between
                                      rounded-2xl
                                      border
                                      px-4
                                      text-left

                                      ${
                                        displayOption.enabled
                                          ? "border-green-200 bg-green-50"
                                          : "border-[#E75480]/15 bg-white"
                                      }

                                      disabled:opacity-50
                                    `}
                                  >
                                    <span
                                      className={`
                                        text-sm
                                        font-medium

                                        ${
                                          displayOption.enabled
                                            ? "text-green-700"
                                            : "text-ink"
                                        }
                                      `}
                                    >
                                      {displayOption.enabled
                                        ? "Enabled"
                                        : "Disabled"}
                                    </span>

                                    <ToggleVisual
                                      checked={
                                        displayOption.enabled
                                      }
                                    />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4">
                                <FieldLabel>
                                  Free Shipping
                                </FieldLabel>

                                <button
                                  type="button"
                                  disabled={
                                    busy ||
                                    !displayOption.enabled
                                  }
                                  onClick={() =>
                                    updateShippingDraft(
                                      "freeShipping",
                                      !displayOption.freeShipping
                                    )
                                  }
                                  className={`
                                    flex
                                    h-12
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-2xl
                                    border
                                    px-4
                                    text-left

                                    ${
                                      displayOption.freeShipping
                                        ? "border-green-200 bg-green-50"
                                        : "border-[#E75480]/15 bg-white"
                                    }

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  `}
                                >
                                  <span
                                    className={`
                                      text-sm
                                      font-medium

                                      ${
                                        displayOption.freeShipping
                                          ? "text-green-700"
                                          : "text-ink"
                                      }
                                    `}
                                  >
                                    {displayOption.freeShipping
                                      ? "Free shipping active"
                                      : "Charge normal fee"}
                                  </span>

                                  <ToggleVisual
                                    checked={
                                      displayOption.freeShipping
                                    }
                                  />
                                </button>
                              </div>

                              {displayOption.enabled &&
                                displayOption.freeShipping && (
                                  <div className="mt-4">
                                    <FieldLabel>
                                      Free Shipping Note
                                    </FieldLabel>

                                    <input
                                      type="text"
                                      value={
                                        displayOption.freeShippingNote
                                      }
                                      disabled={
                                        busy
                                      }
                                      maxLength={
                                        500
                                      }
                                      placeholder="Example: Free shipping this week"
                                      onChange={(
                                        event
                                      ) =>
                                        updateShippingDraft(
                                          "freeShippingNote",
                                          event.target.value
                                        )
                                      }
                                      className="
                                        h-12
                                        w-full
                                        rounded-2xl
                                        border
                                        border-green-200
                                        bg-white
                                        px-4
                                        text-sm
                                        text-ink
                                        outline-none

                                        focus:border-green-400

                                        disabled:opacity-50
                                      "
                                    />
                                  </div>
                                )}

                              {displayOption.enabled && (
                                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#E75480]/10 bg-white p-4">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted">
                                      Checkout Preview
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-ink">
                                      {displayOption.label ||
                                        "Shipping Region"}
                                    </p>

                                    {displayOption.freeShipping &&
                                      displayOption.freeShippingNote && (
                                        <p className="mt-1 text-xs text-green-600">
                                          {
                                            displayOption.freeShippingNote
                                          }
                                        </p>
                                      )}
                                  </div>

                                  {displayOption.freeShipping ? (
                                    <div className="text-right">
                                      <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
                                        FREE
                                      </span>

                                      {displayOption.price >
                                        0 && (
                                        <p className="mt-1 text-xs text-muted line-through">
                                          Rs.{" "}
                                          {Number(
                                            displayOption.price
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="font-semibold text-[#E75480]">
                                      Rs.{" "}
                                      {Number(
                                        displayOption.price
                                      ).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={
                                    cancelEditShipping
                                  }
                                  className="
                                    rounded-full
                                    border
                                    border-[#E75480]/20
                                    bg-white
                                    px-6
                                    py-3
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[1.5px]
                                    text-muted

                                    hover:bg-[#FFF5F8]

                                    disabled:opacity-50
                                  "
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={
                                    saveShippingOption
                                  }
                                  className="
                                    rounded-full
                                    bg-[#E75480]
                                    px-6
                                    py-3
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[1.5px]
                                    text-white
                                    transition

                                    hover:bg-[#D94873]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  {busy
                                    ? "Saving..."
                                    : "Save Changes"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </SettingsCard>
            </div>
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}

          {activeTab ===
            "footer" && (
            <SettingsCard
              title="Footer Settings"
              description="Manage the public website footer."
            >
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <SettingSwitch
                  title="Social Links"
                  description="Display social links"
                  checked={
                    settings
                      .footer
                      .showSocialLinks
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showSocialLinks"
                    )
                  }
                />

                <SettingSwitch
                  title="Admin Login"
                  description="Display admin login"
                  checked={
                    settings
                      .footer
                      .showAdminLogin
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showAdminLogin"
                    )
                  }
                />

                <SettingSwitch
                  title="Book Appointment"
                  description="Display booking CTA"
                  checked={
                    settings
                      .footer
                      .showBookAppointment
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showBookAppointment"
                    )
                  }
                />

                <SettingSwitch
                  title="Branches"
                  description="Display branches"
                  checked={
                    settings
                      .footer
                      .showBranches
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showBranches"
                    )
                  }
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Copyright Text"
                    value={
                      settings
                        .footer
                        .copyrightText
                    }
                    onChange={(
                      value
                    ) =>
                      updateFooterText(
                        "copyrightText",
                        value
                      )
                    }
                  />
                </div>

                <Input
                  label="Developer Name"
                  value={
                    settings
                      .footer
                      .developerName
                  }
                  onChange={(
                    value
                  ) =>
                    updateFooterText(
                      "developerName",
                      value
                    )
                  }
                />

                <Input
                  label="Developer URL"
                  value={
                    settings
                      .footer
                      .developerUrl
                  }
                  onChange={(
                    value
                  ) =>
                    updateFooterText(
                      "developerUrl",
                      value
                    )
                  }
                />

                <Input
                  label="Privacy Policy URL"
                  value={
                    settings
                      .footer
                      .privacyPolicyUrl
                  }
                  onChange={(
                    value
                  ) =>
                    updateFooterText(
                      "privacyPolicyUrl",
                      value
                    )
                  }
                />

                <Input
                  label="Terms URL"
                  value={
                    settings
                      .footer
                      .termsUrl
                  }
                  onChange={(
                    value
                  ) =>
                    updateFooterText(
                      "termsUrl",
                      value
                    )
                  }
                />
              </div>
            </SettingsCard>
          )}

          {/* ==================================================
              EMAIL
          ================================================== */}

          {activeTab ===
            "email" && (
            <SettingsCard
              title="Email"
              description="Send a test email to verify the server email configuration."
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <Input
                    label="Recipient"
                    type="email"
                    value={
                      testEmailTo
                    }
                    placeholder={
                      settings.email ||
                      "Email address"
                    }
                    onChange={
                      setTestEmailTo
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    sendTestEmail
                  }
                  disabled={
                    sendingTest
                  }
                  className="
                    h-12
                    rounded-full
                    border
                    border-[#E75480]
                    px-8
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[2px]
                    text-[#E75480]

                    hover:bg-[#E75480]
                    hover:text-white

                    disabled:opacity-50
                  "
                >
                  {sendingTest
                    ? "Sending..."
                    : "Send Test Email"}
                </button>
              </div>

              {testResult && (
                <p
                  className={`mt-4 text-sm ${
                    testResult.ok
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {
                    testResult.message
                  }
                </p>
              )}
            </SettingsCard>
          )}
        </div>

        {/* ====================================================
            STICKY SAVE BAR
        ==================================================== */}

        {activeTab !==
          "email" && (
          <div
            className="
              sticky
              bottom-4
              z-50
              mt-6
              flex
              flex-col
              gap-4
              rounded-[22px]
              border
              border-[#E75480]/15
              bg-white/95
              p-4
              shadow-[0_14px_45px_rgba(58,42,47,0.15)]
              backdrop-blur-xl

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            <div>
              <p className="font-serif text-lg text-ink">
                Save Changes
              </p>

              <p className="mt-1 text-xs text-muted">
                Save your latest website settings.
              </p>

              {message && (
                <p
                  className={`
                    mt-2
                    text-xs
                    font-medium

                    ${
                      message
                        .toLowerCase()
                        .includes(
                          "success"
                        )
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {
                    message
                  }
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={
                saving ||
                uploadingQr
              }
              onClick={
                handleSave
              }
              className="
                rounded-full
                bg-[#E75480]
                px-8
                py-3.5
                text-xs
                font-semibold
                uppercase
                tracking-[2px]
                text-white

                hover:bg-[#D94873]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CARD
============================================================ */

type SettingsCardProps = {
  title: string;
  description?: string;
  children:
    React.ReactNode;
};

function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section
      className="
        rounded-[28px]
        border
        border-[#E75480]/10
        bg-surface
        p-5
        shadow-sm

        sm:p-7
      "
    >
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-ink">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-muted">
            {
              description
            }
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   FIELD LABEL
============================================================ */

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label
      className="
        mb-2
        block
        text-[10px]
        font-semibold
        uppercase
        tracking-[2px]
        text-muted
      "
    >
      {children}
    </label>
  );
}

/* ============================================================
   INPUT
============================================================ */

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;

  onChange:
    (
      value: string
    ) => void;
};

function Input({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <input
        type={
          type
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="
          h-12
          w-full
          rounded-2xl
          border
          border-[#E75480]/15
          bg-softer
          px-5
          text-sm
          text-ink
          outline-none

          focus:border-[#E75480]/50
          focus:bg-white
        "
      />
    </div>
  );
}

/* ============================================================
   TOGGLE VISUAL
============================================================ */

function ToggleVisual({
  checked,
}: {
  checked: boolean;
}) {
  return (
    <div
      className={`
        relative
        h-6
        w-11
        shrink-0
        rounded-full
        transition

        ${
          checked
            ? "bg-[#E75480]"
            : "bg-[#E8D8DD]"
        }
      `}
    >
      <span
        className={`
          absolute
          top-1
          h-4
          w-4
          rounded-full
          bg-white
          shadow-sm
          transition

          ${
            checked
              ? "left-6"
              : "left-1"
          }
        `}
      />
    </div>
  );
}

/* ============================================================
   SETTING SWITCH
============================================================ */

type SettingSwitchProps = {
  title: string;
  description: string;
  checked: boolean;

  onChange:
    () => void;
};

function SettingSwitch({
  title,
  description,
  checked,
  onChange,
}: SettingSwitchProps) {
  return (
    <button
      type="button"
      onClick={
        onChange
      }
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-[#E75480]/10
        bg-softer
        p-4
        text-left
      "
    >
      <div>
        <p className="text-sm font-medium text-ink">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted">
          {
            description
          }
        </p>
      </div>

      <ToggleVisual
        checked={
          checked
        }
      />
    </button>
  );
}