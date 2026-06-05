import { Link, useLocation } from "react-router-dom";
import { Library, Upload, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-[#2D2D2D] sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <Library className="h-5 w-5 text-[#FF6600]" />
          <span className="font-heading text-lg font-semibold tracking-tight text-white">
            Deal Knowledge Hub
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === "/"
                ? "bg-[#FF6600] text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              Browse
            </span>
          </Link>
          <Link
            to="/upload"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === "/upload"
                ? "bg-[#FF6600] text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              Contribute
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
