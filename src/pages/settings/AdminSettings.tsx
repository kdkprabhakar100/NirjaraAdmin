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
   SHIPPING DEFAULTS
============================================================ */

const defaultShippingOptions: ShippingOption[] = [
  {
    key: "inside-valley",
    label: "Inside Valley",
    price: 0,
    enabled: true,
    freeShipping: false,
    freeShippingNote: "",
  },

  {
    key: "outside-valley",
    label: "Outside Valley",
    price: 0,
    enabled: true,
    freeShipping: false,
    freeShippingNote: "",
  },

  {
    key: "asia",
    label: "Asia",
    price: 0,
    enabled: true,
    freeShipping: false,
    freeShippingNote: "",
  },

  {
    key: "europe",
    label: "Europe",
    price: 0,
    enabled: true,
    freeShipping: false,
    freeShippingNote: "",
  },

  {
    key: "usa",
    label: "USA",
    price: 0,
    enabled: true,
    freeShipping: false,
    freeShippingNote: "",
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
    options: defaultShippingOptions.map(
      (option) => ({
        ...option,
      })
    ),
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
              ) &&
              data.shipping.options
                .length >
                0
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
                : defaultShippingOptions.map(
                    (
                      option
                    ) => ({
                      ...option,
                    })
                  );

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
     SHIPPING
  ============================================================ */

  const updateShippingOption = (
    key: string,

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
                option
              ) =>
                option.key ===
                key
                  ? {
                      ...option,

                      [field]:
                        value,
                    }
                  : option
            ),
        },
      })
    );

    setMessage(
      ""
    );
  };

  const toggleShippingEnabled = (
    key: string
  ) => {
    const option =
      settings.shipping.options.find(
        (
          item
        ) =>
          item.key ===
          key
      );

    if (
      !option
    ) {
      return;
    }

    updateShippingOption(
      key,
      "enabled",
      !option.enabled
    );
  };

  const toggleFreeShipping = (
    key: string
  ) => {
    const option =
      settings.shipping.options.find(
        (
          item
        ) =>
          item.key ===
          key
      );

    if (
      !option
    ) {
      return;
    }

    updateShippingOption(
      key,
      "freeShipping",
      !option.freeShipping
    );
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

        /* ======================================================
           NORMALIZE SHIPPING
        ====================================================== */

        const shippingPayload = {
          options:
            settings.shipping.options.map(
              (
                option
              ) => ({
                key:
                  option.key,

                label:
                  option.label,

                price:
                  Number(
                    option.price
                  ),

                enabled:
                  option.enabled,

                freeShipping:
                  option.freeShipping,

                freeShippingNote:
                  option.freeShippingNote,
              })
            ),
        };

        /* ======================================================
           FULL PAYLOAD
        ====================================================== */

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

          shipping:
            shippingPayload,

          footer:
            settings.footer,
        };

        console.log(
          "FULL SETTINGS PAYLOAD:",
          payload
        );

        console.log(
          "SHIPPING BEING SAVED:",
          shippingPayload
        );

        /* ======================================================
           IMPORTANT FIX

           Send PAYLOAD, not shippingPayload.
        ====================================================== */

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

        console.log(
          "SAVE SETTINGS RESPONSE:",
          data
        );

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Could not save settings."
          );
        }

        /* ======================================================
           UPDATE LOCAL STATE FROM SERVER
        ====================================================== */

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

            shipping: {
              options:
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
                  : previous.shipping
                      .options,
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
                  SHIPPING
              ================================================== */}

              <SettingsCard
                title="Shipping Rates"
                description="Configure delivery fees and free-shipping promotions."
              >
                <div className="space-y-4">
                  {settings.shipping.options.map(
                    (
                      option
                    ) => (
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
                        {/* HEADER */}

                        <div
                          className="
                            flex
                            flex-col
                            gap-4

                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div>
                            <h3 className="font-serif text-xl text-ink">
                              {
                                option.label
                              }
                            </h3>

                            <p className="mt-1 text-xs text-muted">
                              {option.enabled
                                ? option.freeShipping
                                  ? `Regular fee: Rs. ${Number(
                                      option.price
                                    ).toLocaleString()} · FREE now`
                                  : `Current shipping fee: Rs. ${Number(
                                      option.price
                                    ).toLocaleString()}`
                                : "Shipping option disabled"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                              {option.enabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>

                            <Toggle
                              checked={
                                option.enabled
                              }
                              onClick={() =>
                                toggleShippingEnabled(
                                  option.key
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* CONTROLS */}

                        <div
                          className="
                            mt-5
                            grid
                            gap-4

                            md:grid-cols-2
                          "
                        >
                          {/* PRICE */}

                          <div>
                            <FieldLabel>
                              Normal Shipping Fee
                            </FieldLabel>

                            <div className="relative">
                              <span
                                className="
                                  pointer-events-none
                                  absolute
                                  left-4
                                  top-1/2
                                  -translate-y-1/2
                                  text-sm
                                  text-muted
                                "
                              >
                                Rs.
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                disabled={
                                  !option.enabled
                                }
                                value={
                                  option.price
                                }
                                onChange={(
                                  event
                                ) => {
                                  const raw =
                                    event.target
                                      .value;

                                  const parsed =
                                    raw ===
                                    ""
                                      ? 0
                                      : Number(
                                          raw
                                        );

                                  updateShippingOption(
                                    option.key,
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
                                  transition

                                  focus:border-[#E75480]/50

                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              />
                            </div>
                          </div>

                          {/* FREE SHIPPING */}

                          <div>
                            <FieldLabel>
                              Free Shipping
                            </FieldLabel>

                            <button
                              type="button"
                              disabled={
                                !option.enabled
                              }
                              onClick={() =>
                                toggleFreeShipping(
                                  option.key
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
                                  option.freeShipping
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
                                    option.freeShipping
                                      ? "text-green-700"
                                      : "text-ink"
                                  }
                                `}
                              >
                                {option.freeShipping
                                  ? "Free shipping active"
                                  : "Charge normal fee"}
                              </span>

                              <ToggleVisual
                                checked={
                                  option.freeShipping
                                }
                              />
                            </button>
                          </div>
                        </div>

                        {/* FREE SHIPPING NOTE */}

                        {option.enabled &&
                          option.freeShipping && (
                            <div className="mt-4">
                              <FieldLabel>
                                Free Shipping Note
                              </FieldLabel>

                              <input
                                type="text"
                                value={
                                  option.freeShippingNote
                                }
                                maxLength={
                                  500
                                }
                                placeholder="Example: Free shipping this week"
                                onChange={(
                                  event
                                ) =>
                                  updateShippingOption(
                                    option.key,
                                    "freeShippingNote",
                                    event.target
                                      .value
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
                                "
                              />
                            </div>
                          )}

                        {/* PREVIEW */}

                        {option.enabled && (
                          <div
                            className="
                              mt-5
                              flex
                              items-center
                              justify-between
                              gap-4
                              rounded-2xl
                              border
                              border-[#E75480]/10
                              bg-white
                              p-4
                            "
                          >
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted">
                                Checkout Preview
                              </p>

                              <p className="mt-1 text-sm font-medium text-ink">
                                {
                                  option.label
                                }
                              </p>

                              {option.freeShipping &&
                                option.freeShippingNote && (
                                  <p className="mt-1 text-xs text-green-600">
                                    {
                                      option.freeShippingNote
                                    }
                                  </p>
                                )}
                            </div>

                            {option.freeShipping ? (
                              <div className="text-right">
                                <span
                                  className="
                                    rounded-full
                                    bg-green-100
                                    px-4
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-green-700
                                  "
                                >
                                  FREE
                                </span>

                                {option.price >
                                  0 && (
                                  <p className="mt-1 text-xs text-muted line-through">
                                    Rs.{" "}
                                    {Number(
                                      option.price
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="font-semibold text-[#E75480]">
                                Rs.{" "}
                                {Number(
                                  option.price
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
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
   TOGGLE BUTTON
============================================================ */

function Toggle({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="shrink-0"
    >
      <ToggleVisual
        checked={
          checked
        }
      />
    </button>
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