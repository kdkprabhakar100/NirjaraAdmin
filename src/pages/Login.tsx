import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin({
        email,
        password,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF5F8] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-[#E75480]">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-[#8A6F78]">
            Sign in to manage your website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-[#3A2A2F]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              required
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 outline-none focus:border-[#E75480]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#3A2A2F]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
              className="w-full rounded-xl border border-[#E75480]/20 bg-[#FFF5F8] px-4 py-3 outline-none focus:border-[#E75480]"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#E75480] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#d94873] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}