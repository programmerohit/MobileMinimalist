import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { App, Settings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { 
  Phone, Users, MessageCircle, Clock, Camera, Image, 
  Calendar, FileText, Smartphone, X, CreditCard
} from "lucide-react";

export default function Restricted() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  
  const { data: selectedApps, isLoading } = useQuery<App[]>({
    queryKey: ['/api/apps/selected'],
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
  
  const exitRestrictedMode = () => {
    updateSettingsMutation.mutate(false);
    setIsExitDialogOpen(false);
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
        onConfirm={exitRestrictedMode}
        title="Exit Minimalist Mode?"
        description="This will allow access to all apps."
      />
    </div>
  );
}
