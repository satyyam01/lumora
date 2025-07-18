import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeProvider, ThemeSwitcher } from "./ThemeProvider";

function Navbar() {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <nav className="w-full bg-white/80 dark:bg-background-dark/80 border-b shadow-sm mb-8 backdrop-blur">
      <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-heading font-bold tracking-tight text-brand">
          Lumora
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {isLoggedIn ? (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <Button asChild variant="outline"><Link to="/login">Login</Link></Button>
              <Button asChild variant="outline"><Link to="/register">Register</Link></Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-background-light to-white dark:from-brand-dark dark:via-background-dark dark:to-gray-900 transition-colors">
        <Navbar />
        <main className="p-4 max-w-3xl mx-auto">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6">
          A digital second brain for reflection, growth, and clarity.
        </footer>
      </div>
    </ThemeProvider>
  );
} 