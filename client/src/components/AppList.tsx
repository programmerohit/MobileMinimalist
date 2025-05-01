import { App } from "@shared/schema";
import { AppCard } from "@/components/AppCard";

interface AppListProps {
  apps: App[];
}

export function AppList({ apps }: AppListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {apps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
