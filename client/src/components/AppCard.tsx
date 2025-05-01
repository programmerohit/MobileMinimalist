import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { App } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { 
  Phone, Users, MessageCircle, Clock, Camera, Image, 
  Calendar, FileText, Smartphone
} from "lucide-react";

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, selected }: { id: number; selected: boolean }) => {
      const response = await apiRequest('PATCH', `/api/apps/${id}`, { selected });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
    }
  });
  
  const handleCheckboxChange = (checked: boolean) => {
    updateAppMutation.mutate({ id: app.id, selected: checked });
  };
  
  const getIcon = () => {
    switch (app.icon) {
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'message-circle': return <MessageCircle className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'file-text': return <FileText className="h-5 w-5" />;
      default: return <Smartphone className="h-5 w-5" />;
    }
  };
  
  const getColorClasses = () => {
    switch (app.color) {
      case 'green': return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'orange': return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'purple': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'pink': return { bg: 'bg-pink-100', text: 'text-pink-600' };
      case 'yellow': return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };
  
  const { bg, text } = getColorClasses();
  
  return (
    <Card className="p-4 flex items-center">
      <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mr-4`}>
        <span className={text}>
          {getIcon()}
        </span>
      </div>
      <div className="flex-grow">
        <h3 className="font-medium">{app.name}</h3>
        <p className="text-sm text-muted-foreground">{app.description}</p>
      </div>
      <Checkbox 
        id={`app-checkbox-${app.id}`}
        checked={app.selected}
        onCheckedChange={handleCheckboxChange}
        disabled={updateAppMutation.isPending}
      />
    </Card>
  );
}
