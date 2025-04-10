
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BarChart, 
  Search, 
  FileText, 
  Users,
  Shield,
  Settings
} from 'lucide-react';

const SidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex flex-col space-y-1">
          <SidebarLink 
            to="/dashboard" 
            icon={<LayoutDashboard size={20} />} 
            label="Tableau de bord" 
          />
          <SidebarLink 
            to="/scan/new" 
            icon={<Search size={20} />} 
            label="Nouveau scan" 
          />
          <SidebarLink 
            to="/stats" 
            icon={<BarChart size={20} />} 
            label="Statistiques" 
          />
          <SidebarLink 
            to="/reports" 
            icon={<FileText size={20} />} 
            label="Rapports" 
          />
          
          {isAdmin && (
            <>
              <div className="py-2">
                <p className="px-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Administration
                </p>
              </div>
              <SidebarLink 
                to="/admin/dashboard" 
                icon={<Shield size={20} />} 
                label="Admin Dashboard" 
              />
              <SidebarLink 
                to="/admin/users" 
                icon={<Users size={20} />} 
                label="Utilisateurs" 
              />
              <SidebarLink 
                to="/admin/settings" 
                icon={<Settings size={20} />} 
                label="Paramètres" 
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
