import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  FileDown,
  Menu,
  X,
  LogOut,
  Database,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'student'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'student'] },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, roles: ['admin', 'student'] },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'student'] },
    { id: 'export', label: 'Export PDF', icon: FileDown, roles: ['admin', 'student'] },
    { id: 'backup', label: 'Backup', icon: Database, roles: ['admin'] }
  ].filter(item => item.roles.includes(currentUser.role));

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">BS Attendance</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeView === item.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
              
              {/* User Info & Logout */}
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4" />
                  <span>{currentUser.username}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-2 py-1 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>{currentUser.username}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">{currentUser.username}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      currentUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentUser.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-2 py-1 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>

              {/* Navigation Items */}
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-200 ${
                        activeView === item.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;