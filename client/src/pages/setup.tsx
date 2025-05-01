import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { App, Settings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { AppList } from "@/components/AppList";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Setup() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: apps, isLoading: isLoadingApps } = useQuery<App[]>({
    queryKey: ['/api/apps'],
  });
  
  const { data: settings, isLoading: isLoadingSettings } = useQuery<Settings>({ 
    queryKey: ['/api/settings'],
  });
  
  const [restrictedMode, setRestrictedMode] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setRestrictedMode(settings.restrictedMode);
    }
  }, [settings]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (restrictedMode: boolean) => {
      const response = await apiRequest('PATCH', '/api/settings', { restrictedMode });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      if (restrictedMode) {
        setLocation('/restricted');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  });
  
  const toggleRestrictedMode = (checked: boolean) => {
    setRestrictedMode(checked);
  };
  
  const applySettings = () => {
    const selectedApps = apps?.filter(app => app.selected) || [];
    if (selectedApps.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one app",
        variant: "destructive"
      });
      return;
    }
    
    updateSettingsMutation.mutate(true);
  };
  
  const isLoading = isLoadingApps || isLoadingSettings;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-xl font-medium text-primary">
          Loading...
        </div>
      </div>
    );
  }
  
  const selectedCount = apps?.filter(app => app.selected).length || 0;
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground mb-2">Minimalist Launcher</h1>
        <p className="text-muted-foreground">Select 3-4 apps you want to access in restricted mode</p>
      </div>
      
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-foreground">Restricted Mode</h2>
            <p className="text-sm text-muted-foreground">Only show selected apps</p>
          </div>
          <Switch 
            checked={restrictedMode}
            onCheckedChange={toggleRestrictedMode}
          />
        </div>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-foreground mb-3">Available Apps</h2>
        <p className="text-sm text-muted-foreground mb-4">Select 3-4 apps to include</p>
        
        {apps && <AppList apps={apps} />}
      </div>
      
      <div className="text-center text-muted-foreground mb-6">
        <p>{selectedCount} apps selected</p>
      </div>
      
      <Button
        onClick={applySettings}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
        disabled={updateSettingsMutation.isPending}
      >
        <Check className="h-6 w-6" />
      </Button>
    </div>
  );
}
