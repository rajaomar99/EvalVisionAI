import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { registerUser } from "../../services/authApi";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const GOOGLE_AUTH_URL = (import.meta.env.VITE_API_BASE_URL || 
"http://localhost:5000/api").replace(/\/api$/, "") + "/api/auth/google";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must be at least 8 characters long, and include at least one uppercase letter and one symbol."); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); return;
    }

    try {
      setError("");
      setLoading(true);
      const data = await registerUser({ name, email, password });
      saveAuth(data);
      navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleRegister() {
    window.location.href = GOOGLE_AUTH_URL;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-zinc-900 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-zinc-900">Create your account</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-zinc-900 hover:text-zinc-700">Sign in</Link>
          </p>
        </div>

        <div className="rounded-sm border border-zinc-200 bg-white p-6 ">
          <button
            id="google-register-btn" type="button" onClick={handleGoogleRegister}
            className="mb-5 flex w-full items-center justify-center rounded-sm border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-800  transition hover:bg-zinc-50 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">or create account with email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">{error}</div>
            )}
            {[
              { id: "register-name",             label: "Full Name",        type: "text",     value: name,            setter: setName,            placeholder: "Jane Doe" },
              { id: "register-email",            label: "Email",            type: "email",    value: email,           setter: setEmail,           placeholder: "teacher@school.edu" },
              { id: "register-password",         label: "Password",         type: "password", value: password,        setter: setPassword,        placeholder: "••••••••" },
              { id: "register-confirm-password", label: "Confirm Password", type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "••••••••" },
            ].map(({ id, label, type, value, setter, placeholder }) => (
              <div key={id}>
                <label className="mb-1 block text-sm font-medium text-zinc-800">{label}</label>
                <input
                  id={id} type={type} required value={value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setter(e.target.value); setError(""); }}
                  className="w-full rounded-sm border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 outline-none transition"
                  placeholder={placeholder}
                />
                {id === "register-password" && (
                  <p className="mt-1 text-xs text-zinc-400">Min 8 characters, one uppercase, one symbol</p>
                )}
              </div>
            ))}
            <button
              id="register-submit-btn" type="submit" disabled={loading}
              className="mt-2 w-full rounded-sm bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
