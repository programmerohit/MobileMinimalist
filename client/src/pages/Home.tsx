import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Settings } from "@shared/schema";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  const { data: settings, isLoading } = useQuery<Settings>({ 
    queryKey: ['/api/settings'],
  });
  
  useEffect(() => {
    if (!isLoading && settings) {
      if (settings.restrictedMode) {
        setLocation('/restricted');
      } else {
        setLocation('/setup');
      }
    }
  }, [settings, isLoading, setLocation]);

  // Simple loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-xl font-medium text-primary">
        Loading...
      </div>
    </div>
  );
}
