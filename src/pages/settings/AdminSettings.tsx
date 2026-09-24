import { useEffect, useState } from "react";

type SiteSettings = {
  salonName: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;

  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
};

const initialSettings: SiteSettings = {
  salonName: "Nirjara Beauty",

  description: "",

  email: "",

  phone: "",

  whatsapp: "",

  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
};

export default function AdminSettings() {
  const [settings, setSettings] =
    useState<SiteSettings>(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/site-settings`
      );

      if (!response.ok) {
        throw new Error("Unable to load settings");
      }

      const data = await response.json();

      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof SiteSettings,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSocial = (
    field: keyof SiteSettings["socialLinks"],
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,

      socialLinks: {
        ...previous.socialLinks,
        [field]: value,
      },
    }));
  };

  const saveSettings = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/site-settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${localStorage.getItem(
              "adminToken"
            )}`,
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save settings");
      }

      const data = await response.json();

      setSettings(data);

      alert("Website information updated successfully.");
    } catch (error) {
      console.error(error);

      alert("Unable to update website information.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 outline-none focus:border-[#E75480]";

  if (loading) {
    return (
      <div className="text-[#8A6F78]">
        Loading website settings...
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-4xl text-[#E75480] md:text-5xl">
        Site Settings
      </h1>

      <p className="mt-2 text-[#8A6F78]">
        Manage contact information and social media
        displayed across the website. Branches have
        their own page.
      </p>

      <form
        onSubmit={saveSettings}
        className="mt-8 space-y-8"
      >
        {/* BUSINESS */}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[#3A2A2F]">
            Business Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <input
              className={inputStyle}
              placeholder="Salon Name"
              value={settings.salonName}
              onChange={(e) =>
                updateField("salonName", e.target.value)
              }
            />

            <input
              className={inputStyle}
              type="email"
              placeholder="Email"
              value={settings.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
            />

            <input
              className={inputStyle}
              placeholder="Main Phone Number"
              value={settings.phone}
              onChange={(e) =>
                updateField("phone", e.target.value)
              }
            />

            <input
              className={inputStyle}
              placeholder="WhatsApp Number"
              value={settings.whatsapp}
              onChange={(e) =>
                updateField("whatsapp", e.target.value)
              }
            />

            <textarea
              className={`${inputStyle} md:col-span-2`}
              rows={4}
              placeholder="Business Description"
              value={settings.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
            />
          </div>
        </section>

        {/* SOCIAL MEDIA */}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-[#3A2A2F]">
            Social Media
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <input
              className={inputStyle}
              placeholder="Facebook URL"
              value={settings.socialLinks.facebook}
              onChange={(e) =>
                updateSocial("facebook", e.target.value)
              }
            />

            <input
              className={inputStyle}
              placeholder="Instagram URL"
              value={settings.socialLinks.instagram}
              onChange={(e) =>
                updateSocial("instagram", e.target.value)
              }
            />

            <input
              className={inputStyle}
              placeholder="TikTok URL"
              value={settings.socialLinks.tiktok}
              onChange={(e) =>
                updateSocial("tiktok", e.target.value)
              }
            />

            <input
              className={inputStyle}
              placeholder="YouTube URL"
              value={settings.socialLinks.youtube}
              onChange={(e) =>
                updateSocial("youtube", e.target.value)
              }
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#E75480] px-10 py-4 text-sm font-medium uppercase tracking-[2px] text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}