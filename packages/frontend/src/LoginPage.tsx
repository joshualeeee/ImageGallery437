import React, { useActionState } from "react";
import { Link } from "react-router";
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  onAuth: (token: string) => void;
}

interface ActionResult {
  type: "success" | "error";
  message: string;
  token?: string;
}

export function LoginPage({ isRegistering = false, onAuth }: LoginPageProps) {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();

  const [result, submitAction, isPending] = useActionState<ActionResult | null>(
    async () => {
      const form = document.querySelector("form") as HTMLFormElement;
      const formData = new FormData(form);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      console.log("Form data:", { username, password });

      try {
        const endpoint = isRegistering ? "/auth/register" : "/auth/login";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          return {
            type: "error",
            message: isRegistering
              ? "Failed to create account"
              : "Failed to login",
          };
        }

        const data = await response.json();

        if (data.token) {
          localStorage.setItem("authToken", data.token);
          onAuth(data.token);
        }

        return {
          type: "success",
          message: isRegistering
            ? "Account created successfully!"
            : "Login successful!",
          token: data.token,
        };
      } catch (error) {
        console.error("Network error:", error);
        return {
          type: "error",
          message: "Failed to connect to server",
        };
      }
    },
    null
  );

  return (
    <>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      {result && (
        <p className={`LoginPage-message ${result.type}`} aria-live="polite">
          {result.message}
        </p>
      )}
      {isPending && <p className="LoginPage-message loading">Loading...</p>}
      <form className="LoginPage-form" action={submitAction}>
        <label htmlFor={usernameInputId}>Username</label>
        <input
          id={usernameInputId}
          name="username"
          required
          disabled={isPending}
        />

        <label htmlFor={passwordInputId}>Password</label>
        <input
          id={passwordInputId}
          name="password"
          type="password"
          required
          disabled={isPending}
        />

        <input
          type="submit"
          value={isRegistering ? "Register" : "Login"}
          disabled={isPending}
        />
      </form>
      {!isRegistering && (
        <p className="LoginPage-register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </>
  );
}
