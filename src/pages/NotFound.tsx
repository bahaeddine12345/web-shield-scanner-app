
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center px-8">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oups! La page que vous recherchez n'existe pas.
        </p>
        <Link to="/">
          <Button size="lg">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
