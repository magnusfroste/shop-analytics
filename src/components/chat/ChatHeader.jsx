import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose, Settings, Plus, Moon, Sun, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUserRole } from '../../hooks/useUserRole';

const ChatHeader = ({ 
  onToggleSidebar, 
  onToggleDashboard, 
  onNewChat,
  onOpenSettings,
  onSignOut,
  isSidebarOpen,
  isDashboardOpen,
  title = "Ny konversation"
}) => {
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
          title={isSidebarOpen ? "Stäng sidebar" : "Öppna sidebar"}
        >
          <PanelLeftClose className={`h-4 w-4 transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Ny chatt</span>
        </Button>
      </div>

      <h1 className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
        {title}
      </h1>

      <div className="flex items-center gap-1">
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/users')}
            className="h-8 w-8"
            title="Användarhantering"
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
          title="Växla tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8"
          title="Inställningar"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
          className="h-8 w-8"
          title="Logga ut"
        >
          <LogOut className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDashboard}
          className="h-8 w-8"
          title={isDashboardOpen ? "Stäng dashboard" : "Öppna dashboard"}
        >
          <PanelRightClose className={`h-4 w-4 transition-transform ${!isDashboardOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
