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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Lock, Eye, EyeOff } from "lucide-react";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasSetPassword, setHasSetPassword] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setRestrictedMode(settings.restrictedMode || false);
      setHasSetPassword(!!settings.password);
    }
  }, [settings]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { restrictedMode?: boolean, password?: string }) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      if (variables.restrictedMode) {
        setLocation('/restricted');
      } else if (variables.password) {
        setHasSetPassword(true);
        toast({
          title: "Password Set",
          description: "Your protection password has been set"
        });
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
  
  const savePassword = () => {
    // Validation
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter a password",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    updateSettingsMutation.mutate({ password });
    setPassword("");
    setConfirmPassword("");
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
    
    if (!hasSetPassword) {
      toast({
        title: "Password Required",
        description: "Please set a password for exit protection",
        variant: "destructive"
      });
      return;
    }
    
    updateSettingsMutation.mutate({ restrictedMode: true });
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

      <Card className="p-4 mb-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Exit Protection</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {hasSetPassword 
              ? "Password protection is enabled" 
              : "Set a password to protect restricted mode"}
          </p>
        </div>
        
        {!hasSetPassword ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>
            
            <Button 
              onClick={savePassword} 
              className="w-full"
              disabled={updateSettingsMutation.isPending}
            >
              Set Password
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setHasSetPassword(false);
              updateSettingsMutation.mutate({ password: "" });
            }}
          >
            Change Password
          </Button>
        )}
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
