import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 font-sans transition-colors">
      <div className="text-center max-w-md glass-card p-8 rounded-[28px] border border-[#E8E7EF] dark:border-white/10 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-[#F7DDE9] dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
          <AlertCircle size={30} strokeWidth={2} />
        </div>
        <h1 className="text-5xl font-black font-display text-[#7467E8]">
          404
        </h1>
        <h2 className="text-lg font-bold text-foreground">Page Not Found</h2>
        <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
          The requested page <span className="font-mono text-[#7467E8] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-2 py-0.5 rounded-md">{location.pathname}</span> does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Button asChild className="rounded-full px-6 py-5 font-bold gap-2">
            <Link to="/">
              <ArrowLeft size={16} strokeWidth={2} />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
