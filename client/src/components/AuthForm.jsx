import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function AuthForm({ mode, onSubmit, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!email || !password) return;
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-2 capitalize">{mode}</h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {touched && (!email || !password) && (
        <div className="text-red-500 text-sm">Email and password are required.</div>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full mt-2">
        {mode === "register" ? "Register" : "Login"}
      </Button>
    </form>
  );
} 