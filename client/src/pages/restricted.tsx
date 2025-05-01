import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { App, Settings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PasswordDialog } from "@/components/PasswordDialog";
import { Button } from "@/components/ui/button";
import { 
  Phone, Users, MessageCircle, Clock, Camera, Image, 
  Calendar, FileText, Smartphone, X, CreditCard
} from "lucide-react";

export default function Restricted() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  
  const { data: selectedApps, isLoading: isLoadingApps } = useQuery<App[]>({
    queryKey: ['/api/apps/selected'],
  });
  
  const { data: settings, isLoading: isLoadingSettings } = useQuery<Settings>({ 
    queryKey: ['/api/settings'],
  });
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (restrictedMode: boolean) => {
      const response = await apiRequest('PATCH', '/api/settings', { restrictedMode });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setLocation('/setup');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to exit restricted mode",
        variant: "destructive"
      });
    }
  });
  
  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', '/api/verify-password', { password });
      return await response.json();
    },
    onSuccess: () => {
      setPasswordError(undefined);
      updateSettingsMutation.mutate(false);
      setIsPasswordDialogOpen(false);
    },
    onError: (error) => {
      setPasswordError("Incorrect password. Please try again.");
    }
  });
  
  const handleExitConfirm = () => {
    setIsExitDialogOpen(false);
    if (settings?.password) {
      setIsPasswordDialogOpen(true);
      setPasswordError(undefined);
    } else {
      // No password set, proceed with exit
      updateSettingsMutation.mutate(false);
    }
  };
  
  const handlePasswordSubmit = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    
    verifyPasswordMutation.mutate(password);
  };
  
  const getIconForApp = (iconName: string) => {
    switch (iconName) {
      case 'phone': return <Phone className="h-6 w-6" />;
      case 'users': return <Users className="h-6 w-6" />;
      case 'message-circle': return <MessageCircle className="h-6 w-6" />;
      case 'clock': return <Clock className="h-6 w-6" />;
      case 'camera': return <Camera className="h-6 w-6" />;
      case 'image': return <Image className="h-6 w-6" />;
      case 'calendar': return <Calendar className="h-6 w-6" />;
      case 'file-text': return <FileText className="h-6 w-6" />;
      case 'credit-card': return <CreditCard className="h-6 w-6" />;
      default: return <Smartphone className="h-6 w-6" />;
    }
  };
  
  const launchApp = (app: App) => {
    toast({
      title: `Launching ${app.name}`,
      description: "This is a simulation in a web environment",
    });
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
  
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium text-foreground mb-2">Minimalist Mode</h1>
        <p className="text-muted-foreground">Only showing selected apps</p>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center gap-6">
        {selectedApps && selectedApps.map(app => (
          <button
            key={app.id}
            className="w-full max-w-md bg-card rounded-lg shadow-md p-6 flex items-center"
            onClick={() => launchApp(app)}
          >
            <div className={`w-14 h-14 rounded-full bg-${app.color}-100 flex items-center justify-center mr-5`}>
              <span className={`text-3xl text-${app.color}-600`}>
                {getIconForApp(app.icon)}
              </span>
            </div>
            <span className="text-xl">{app.name}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          className="py-3 px-6 text-primary rounded-full shadow-md font-medium"
          onClick={() => setIsExitDialogOpen(true)}
        >
          Exit Minimalist Mode
        </Button>
      </div>
      
      <ConfirmDialog
        isOpen={isExitDialogOpen}
        onClose={() => setIsExitDialogOpen(false)}
        onConfirm={handleExitConfirm}
        title="Exit Minimalist Mode?"
        description="This will allow access to all apps."
      />
      
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onConfirm={handlePasswordSubmit}
        title="Enter Password"
        description="Please enter your password to exit minimalist mode."
        error={passwordError}
      />
    </div>
  );
}
