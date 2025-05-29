
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="space-y-3">
          <Button asChild className="bg-kasadya-purple hover:bg-kasadya-deep-purple w-full">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/vendors">Browse Vendors</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/services">Explore Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
