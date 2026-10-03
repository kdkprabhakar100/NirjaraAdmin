import { useEffect, useState } from "react";

type SocialLinks = {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
};

type FooterSettings = {
  showSocialLinks: boolean;
  showAdminLogin: boolean;
  showBookAppointment: boolean;

  copyrightText: string;

  developerName: string;
  developerUrl: string;
};

type SiteSettings = {
  salonName: string;
  description: string;

  email: string;
  phone: string;
  whatsapp: string;

  socialLinks: SocialLinks;

  footer: FooterSettings;
};

type TabId =
  | "business"
  | "social"
  | "footer"
  | "email";

const TABS: {
  id: TabId;
  label: string;
}[] = [
  { id: "business", label: "Business" },
  { id: "social", label: "Social Media" },
  { id: "footer", label: "Footer" },
  { id: "email", label: "Email" },
];

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

  footer: {
    showSocialLinks: true,
    showAdminLogin: true,
    showBookAppointment: true,

    copyrightText:
      "© 2026 Nirjara Beauty. All rights reserved.",

    developerName: "Prabhakar Khadka",
    developerUrl: "",
  },
};

export default function AdminSettings() {
  const [settings, setSettings] =
    useState<SiteSettings>(initialSettings);

  const [activeTab, setActiveTab] =
    useState<TabId>("business");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [testEmailTo, setTestEmailTo] =
    useState("");

  const [sendingTest, setSendingTest] =
    useState(false);

  const [testResult, setTestResult] =
    useState<{
      ok: boolean;
      message: string;
    } | null>(null);

  const API_URL =
    import.meta.env.VITE_API_URL;

  // =====================================================
  // FETCH SETTINGS
  // =====================================================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/site-settings`
        );

        if (!response.ok) {
          throw new Error(
            "Could not load site settings."
          );
        }

        const data = await response.json();

        setSettings({
          salonName:
            data.salonName ??
            initialSettings.salonName,

          description:
            data.description ??
            initialSettings.description,

          email: data.email ?? "",

          phone: data.phone ?? "",

          whatsapp: data.whatsapp ?? "",

          socialLinks: {
            facebook:
              data.socialLinks?.facebook ?? "",

            instagram:
              data.socialLinks?.instagram ?? "",

            tiktok:
              data.socialLinks?.tiktok ?? "",

            youtube:
              data.socialLinks?.youtube ?? "",
          },

          footer: {
            showSocialLinks:
              data.footer?.showSocialLinks ??
              true,

            showAdminLogin:
              data.footer?.showAdminLogin ??
              true,

            showBookAppointment:
              data.footer
                ?.showBookAppointment ?? true,

            copyrightText:
              data.footer?.copyrightText ??
              initialSettings.footer
                .copyrightText,

            developerName:
              data.footer?.developerName ??
              initialSettings.footer
                .developerName,

            developerUrl:
              data.footer?.developerUrl ?? "",
          },
        });
      } catch (error) {
        console.error(error);

        setMessage(
          "Could not load site settings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [API_URL]);

  // =====================================================
  // NORMAL INPUT
  // =====================================================

  const updateField = (
    field:
      | "salonName"
      | "description"
      | "email"
      | "phone"
      | "whatsapp",
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // SOCIAL MEDIA
  // =====================================================

  const updateSocial = (
    network: keyof SocialLinks,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,

      socialLinks: {
        ...previous.socialLinks,
        [network]: value,
      },
    }));
  };

  // =====================================================
  // FOOTER TEXT
  // =====================================================

  const updateFooterText = (
    field:
      | "copyrightText"
      | "developerName"
      | "developerUrl",
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,

      footer: {
        ...previous.footer,
        [field]: value,
      },
    }));
  };

  // =====================================================
  // FOOTER SWITCH
  // =====================================================

  const updateFooterSwitch = (
    field:
      | "showSocialLinks"
      | "showAdminLogin"
      | "showBookAppointment"
  ) => {
    setSettings((previous) => ({
      ...previous,

      footer: {
        ...previous.footer,

        [field]:
          !previous.footer[field],
      },
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/api/site-settings`,
        {
          method: "PUT",

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

          // Branches have their own page and
          // are left out, so saving here never
          // overwrites them.
          body: JSON.stringify({
            salonName: settings.salonName,
            description: settings.description,
            email: settings.email,
            phone: settings.phone,
            whatsapp: settings.whatsapp,
            socialLinks: settings.socialLinks,
            footer: settings.footer,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not save settings."
        );
      }

      setMessage(
        "Settings saved successfully."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // TEST EMAIL
  // =====================================================

  const sendTestEmail = async () => {
    const to =
      testEmailTo.trim() || settings.email;

    if (!to) {
      setTestResult({
        ok: false,
        message:
          "Enter an email address to send the test to.",
      });
      return;
    }

    try {
      setSendingTest(true);
      setTestResult(null);

      const response = await fetch(
        `${API_URL}/api/site-settings/test-email`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
          },

          body: JSON.stringify({ to }),
        }
      );

      // The server explains failures (not configured,
      // wrong password …) in `message`.
      const data = await response
        .json()
        .catch(() => ({}));

      setTestResult({
        ok: response.ok,
        message:
          data.message ??
          (response.ok
            ? "Test email sent."
            : "Unable to send test email."),
      });
    } catch (error) {
      console.error(error);

      setTestResult({
        ok: false,
        message: "Unable to reach the server.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-muted">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft p-5 sm:p-7 lg:p-8">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="mx-auto max-w-6xl">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[4px] text-[#E75480]">
            Website
          </p>

          <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
            Site Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Manage business information,
            social media and footer settings
            displayed across the Nirjara
            website. Branches have their own
            page.
          </p>
        </div>

        {/* ===========================================
            TABS
        =========================================== */}

        <div
          role="tablist"
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
          {TABS.map((tab) => {
            const active =
              tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() =>
                  setActiveTab(tab.id)
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
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-6">

          {/* ===========================================
              BUSINESS INFORMATION
          =========================================== */}

          {activeTab === "business" && (
            <SettingsCard
              title="Business Information"
              description="General contact information used across the website."
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Input
                  label="Salon Name"
                  value={settings.salonName}
                  placeholder="Nirjara Beauty"
                  onChange={(value) =>
                    updateField(
                      "salonName",
                      value
                    )
                  }
                />

                <Input
                  label="Email"
                  value={settings.email}
                  placeholder="Email address"
                  type="email"
                  onChange={(value) =>
                    updateField(
                      "email",
                      value
                    )
                  }
                />

                <Input
                  label="Phone Number"
                  value={settings.phone}
                  placeholder="Main phone number"
                  onChange={(value) =>
                    updateField(
                      "phone",
                      value
                    )
                  }
                />

                <Input
                  label="WhatsApp Number"
                  value={settings.whatsapp}
                  placeholder="WhatsApp number"
                  onChange={(value) =>
                    updateField(
                      "whatsapp",
                      value
                    )
                  }
                />

              </div>

              <div className="mt-4">

                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted">
                  Description
                </label>

                <textarea
                  value={settings.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={4}
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
                    transition
                    placeholder:text-faint
                    focus:border-[#E75480]/50
                    focus:bg-surface
                  "
                />

              </div>
            </SettingsCard>
          )}

          {/* ===========================================
              SOCIAL MEDIA
          =========================================== */}

          {activeTab === "social" && (
            <SettingsCard
              title="Social Media"
              description="Add your official social media profile links."
            >
              <div className="grid gap-4 md:grid-cols-2">

                <Input
                  label="Facebook"
                  value={
                    settings.socialLinks
                      .facebook
                  }
                  placeholder="Facebook URL"
                  onChange={(value) =>
                    updateSocial(
                      "facebook",
                      value
                    )
                  }
                />

                <Input
                  label="Instagram"
                  value={
                    settings.socialLinks
                      .instagram
                  }
                  placeholder="Instagram URL"
                  onChange={(value) =>
                    updateSocial(
                      "instagram",
                      value
                    )
                  }
                />

                <Input
                  label="TikTok"
                  value={
                    settings.socialLinks
                      .tiktok
                  }
                  placeholder="TikTok URL"
                  onChange={(value) =>
                    updateSocial(
                      "tiktok",
                      value
                    )
                  }
                />

                <Input
                  label="YouTube"
                  value={
                    settings.socialLinks
                      .youtube
                  }
                  placeholder="YouTube URL"
                  onChange={(value) =>
                    updateSocial(
                      "youtube",
                      value
                    )
                  }
                />

              </div>
            </SettingsCard>
          )}

          {/* ===========================================
              FOOTER
          =========================================== */}

          {activeTab === "footer" && (
            <SettingsCard
              title="Footer Settings"
              description="Control what appears in the website footer."
            >

              {/* SWITCHES */}

              <div className="grid gap-3 lg:grid-cols-3">

                <SettingSwitch
                  title="Social Links"
                  description="Display social media icons."
                  checked={
                    settings.footer
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
                  description="Show the admin login link."
                  checked={
                    settings.footer
                      .showAdminLogin
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showAdminLogin"
                    )
                  }
                />

                <SettingSwitch
                  title="Booking CTA"
                  description="Show the booking banner."
                  checked={
                    settings.footer
                      .showBookAppointment
                  }
                  onChange={() =>
                    updateFooterSwitch(
                      "showBookAppointment"
                    )
                  }
                />

              </div>

              {/* FOOTER TEXT */}

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                <div className="md:col-span-2">

                  <Input
                    label="Copyright Text"
                    value={
                      settings.footer
                        .copyrightText
                    }
                    placeholder="© 2026 Nirjara Beauty. All rights reserved."
                    onChange={(value) =>
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
                    settings.footer
                      .developerName
                  }
                  placeholder="Prabhakar Khadka"
                  onChange={(value) =>
                    updateFooterText(
                      "developerName",
                      value
                    )
                  }
                />

                <Input
                  label="Developer Website"
                  value={
                    settings.footer
                      .developerUrl
                  }
                  placeholder="https://example.com"
                  onChange={(value) =>
                    updateFooterText(
                      "developerUrl",
                      value
                    )
                  }
                />

              </div>
            </SettingsCard>
          )}

          {/* ===========================================
              EMAIL TEST — has its own button and
              never saves the settings
          =========================================== */}

          {activeTab === "email" && (
            <SettingsCard
              title="Email"
              description="Send a test email to check that booking emails can be delivered."
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end">

                <div className="flex-1">
                  <Input
                    label="Recipient"
                    value={testEmailTo}
                    placeholder={
                      settings.email ||
                      "Recipient email"
                    }
                    type="email"
                    onChange={setTestEmailTo}
                  />
                </div>

                <button
                  type="button"
                  onClick={sendTestEmail}
                  disabled={sendingTest}
                  className="
                    h-12
                    shrink-0
                    rounded-full
                    border
                    border-[#E75480]
                    px-8
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[2px]
                    text-[#E75480]
                    transition
                    hover:bg-[#E75480]
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {sendingTest
                    ? "Sending..."
                    : "Send Test Email"}
                </button>

              </div>

              <p className="mt-3 text-xs text-muted">
                Leave empty to send it to the
                business email.
              </p>

              {testResult && (
                <p
                  className={`mt-4 text-sm ${
                    testResult.ok
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {testResult.message}
                </p>
              )}
            </SettingsCard>
          )}

          {/* ===========================================
              SAVE AREA — saves every tab at once
          =========================================== */}

          {activeTab !== "email" && (
            <div
              className="
                flex
                flex-col
                gap-4
                rounded-[24px]
                border
                border-[#E75480]/10
                bg-surface
                p-5
                shadow-sm
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p className="font-serif text-xl text-ink">
                  Save Changes
                </p>

                <p className="mt-1 text-xs text-muted">
                  Saves all tabs. Changes will be
                  reflected on the public website.
                </p>

                {message && (
                  <p className="mt-2 text-xs font-medium text-[#E75480]">
                    {message}
                  </p>
                )}

              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
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
                  shadow-sm
                  transition
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
    </div>
  );
}

// =====================================================
// SETTINGS CARD
// =====================================================

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
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
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}

      </div>

      {children}
    </section>
  );
}

// =====================================================
// INPUT
// =====================================================

type InputProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
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

      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
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
          transition
          placeholder:text-faint
          focus:border-[#E75480]/50
          focus:bg-surface
        "
      />

    </div>
  );
}

// =====================================================
// SWITCH
// =====================================================

type SettingSwitchProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
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
      onClick={onChange}
      className="
        flex
        items-center
        justify-between
        gap-5
        rounded-2xl
        border
        border-[#E75480]/10
        bg-softer
        p-4
        text-left
        transition
        hover:border-[#E75480]/30
      "
    >

      <div>

        <p className="text-sm font-medium text-ink">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted">
          {description}
        </p>

      </div>

      <div
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors
          duration-300

          ${
            checked
              ? "bg-[#E75480]"
              : "bg-blush"
          }
        `}
      >
        <div
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-sm
            transition-all
            duration-300

            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />
      </div>

    </button>
  );
}
