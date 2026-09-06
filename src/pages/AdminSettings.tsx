import { useEffect, useState } from "react";

type Branch = {
  name: string;
  label: string;
  address: string;
  phone: string;
  openingHours: string;
  mapUrl: string;
};

type SiteSettings = {
  salonName: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;

  branches: Branch[];

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

  branches: [],

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

  const updateBranch = (
    index: number,
    field: keyof Branch,
    value: string
  ) => {
    setSettings((previous) => {
      const branches = [...previous.branches];

      branches[index] = {
        ...branches[index],
        [field]: value,
      };

      return {
        ...previous,
        branches,
      };
    });
  };

  const addBranch = () => {
    setSettings((previous) => ({
      ...previous,

      branches: [
        ...previous.branches,
        {
          name: "",
          label: "",
          address: "",
          phone: "",
          openingHours: "",
          mapUrl: "",
        },
      ],
    }));
  };

  const removeBranch = (index: number) => {
    if (!window.confirm("Remove this branch?")) return;

    setSettings((previous) => ({
      ...previous,

      branches: previous.branches.filter(
        (_, branchIndex) => branchIndex !== index
      ),
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

          body: JSON.stringify(settings),
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
        Manage contact information, branches and social
        media displayed across the website.
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

        {/* BRANCHES */}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl text-[#3A2A2F]">
                Branches
              </h2>

              <p className="mt-1 text-sm text-[#8A6F78]">
                Manage salon locations and contact details.
              </p>
            </div>

            <button
              type="button"
              onClick={addBranch}
              className="rounded-full border border-[#E75480] px-5 py-2 text-sm text-[#E75480]"
            >
              + Add Branch
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {settings.branches.map((branch, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E75480]/15 bg-[#FFF9FB] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[#E75480]">
                    Branch {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeBranch(index)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className={inputStyle}
                    placeholder="Branch Name"
                    value={branch.name}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className={inputStyle}
                    placeholder="Label e.g. Main Branch"
                    value={branch.label}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "label",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className={inputStyle}
                    placeholder="Address"
                    value={branch.address}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "address",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className={inputStyle}
                    placeholder="Phone"
                    value={branch.phone}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "phone",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className={inputStyle}
                    placeholder="Opening Hours"
                    value={branch.openingHours}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "openingHours",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className={inputStyle}
                    placeholder="Google Maps URL"
                    value={branch.mapUrl}
                    onChange={(e) =>
                      updateBranch(
                        index,
                        "mapUrl",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
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