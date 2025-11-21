"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@meform/ui";
import { ROUTES } from "@meform/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(ROUTES.API.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(ROUTES.DASHBOARD.HOME);
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundSoft">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm border border-lightGray">
        <h1 className="text-3xl font-bold text-center mb-8 text-dark">meform</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error}
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-accent hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

