import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@repo/ui";
import { Zap } from "lucide-react";
import Github from "../icons/Github";

export function RootLayout() {
  const location = useLocation();

  return (
    // Replaced hardcoded zinc colors with shadcn semantic variables for perfect theme support
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">

      {/* Top Navigation Bar: Added glassmorphism effect (backdrop-blur) common in modern dashboards */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          <div className="flex items-center gap-6 md:gap-8">
            {/* Brand Logo Area */}
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold inline-block tracking-tight">
                Meta Architectures
              </span>
            </Link>

            {/* Navigation Links using semantic text muting */}
            <nav className="flex gap-4 md:gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  location.pathname === '/'
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                API Topologies
              </Link>
              <Link
                to="/graphql-ast"
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  location.pathname === '/graphql-ast'
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                GraphQL AST
              </Link>
            </nav>
          </div>

          <div>
            {/* Added GitHub icon to the Auth button for better UX */}
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline-block">Login with GitHub</span>
            </Button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* React Router injects the active page component here */}
        <Outlet />
      </main>

    </div>
  );
}
