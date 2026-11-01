
import { useState } from "react";
import { LockKeyhole, Mail, User, Boxes } from "lucide-react";
import api from "./api";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      if (isRegister) {
        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        setMessage("Registration successful! Please log in.");

        setIsRegister(false);

        setForm({
          name: "",
          email: form.email,
          password: "",
        });
      } else {
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.data)
        );

        onLogin(response.data.data);
      }
    } catch (error) {
      setIsError(true);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">
        <div className="auth-logo">
          <Boxes size={30} />
        </div>

        <h1>RetailFlow</h1>
        <h2>Inventory Management</h2>
        <p>by Abhi</p>
      </div>

      <div className="auth-card">

        <h2>
          {isRegister ? "Create Your Account" : "Welcome Back!"}
        </h2>

        <p className="auth-subtitle">
          {isRegister
            ? "Register to start managing your inventory."
            : "Sign in to manage your inventory."}
        </p>

        {message && (
          <div className={isError ? "auth-error" : "auth-success"}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {isRegister && (
            <>
              <label>Full Name</label>

              <div className="auth-input">
                <User size={18} />

                <input
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <label>Email Address</label>

          <div className="auth-input">
            <Mail size={18} />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label>Password</label>

          <div className="auth-input">
            <LockKeyhole size={18} />

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>

        </form>

        <div className="auth-switch">

          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");

              setForm({
                name: "",
                email: "",
                password: "",
              });
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>

        </div>

      </div>

      <p className="auth-footer">
        © 2026 RetailFlow · Inventory Management by Abhi
      </p>

    </div>
  );
}

export default Auth;
