import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '@/providers';
import { UserRole } from '@/types';
import { APP_NAME, TEXT_LOGIN, TEXT_LOGOUT, TEXT_HOME, TEXT_MY_TICKETS, TEXT_SUPPORT, TEXT_ADMIN_PANEL, TEXT_GATEKEEPER_ACCESS } from '../../constants/constants';
import { ROUTES } from '@/config/routes';
import { adminCheckRole } from '@/features/admin/api/adminService';
import { EventRoleType } from '@/types/enums';

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75h-9c-1.036 0-1.875.84-1.875 1.875v9.75c0 1.036.84 1.875 1.875 1.875h9c1.036 0 1.875-.84 1.875-1.875V8.625c0-1.036-.84-1.875-1.875-1.875Zm-9.75 0V4.875c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v1.875m0 0L12.75 9M9 15h6" /></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>;
const GatekeeperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 0-2.25 2.25c0 1.31.813 2.445 2.068 2.943A5.25 5.25 0 0 0 12 12Z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>;
const XIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>;
const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H12" /></svg>;

interface NavLinkItem {
  path: string;
  label: string;
  roles?: UserRole[];
  icon?: React.ReactNode;
}

const navLinks: NavLinkItem[] = [
  { path: ROUTES.HOME, label: TEXT_HOME, icon: <HomeIcon /> },
  { path: ROUTES.TICKETS.LIST, label: TEXT_MY_TICKETS, roles: [UserRole.USER, UserRole.ADMIN], icon: <TicketIcon /> },
  { path: ROUTES.SUPPORT, label: TEXT_SUPPORT, icon: <SupportIcon /> },
  { path: ROUTES.ADMIN.DASHBOARD, label: TEXT_ADMIN_PANEL, roles: [UserRole.ADMIN], icon: <AdminIcon /> },
  { path: ROUTES.GATEKEEPER, label: TEXT_GATEKEEPER_ACCESS, roles: [UserRole.GATEKEEPER], icon: <GatekeeperIcon /> },
];

const Header: React.FC = () => {
  const { user, logout, selectedEvent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAdminPermission, setHasAdminPermission] = useState<boolean>(false);

  useEffect(() => {
    async function checkAdminPermission() {
      if (!user || !selectedEvent) {
        setHasAdminPermission(false);
        return;
      }
      // If there is a selected event, then that means the user has some permission let's set it to true for now
      let isMounted = true;
      try {
        if (selectedEvent) {
          setHasAdminPermission(true);
        }
      } catch {
        if (isMounted) setHasAdminPermission(false);
      } finally {
        isMounted = false;
      }
    }
    checkAdminPermission();
  }, [user, selectedEvent]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const filteredNavLinks = navLinks.filter(link => {
    if (!link.roles) return true;
    if (!user) return false;
    // Only show admin panel if user has admin permission
    if (link.path === ROUTES.ADMIN.DASHBOARD) {
      return hasAdminPermission;
    }
    return link.roles.includes(user.role);
  });

  return (
    <header className="bg-senai-red text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link 
          to={ROUTES.HOME} 
          className="text-2xl font-bold hover:opacity-80 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {APP_NAME}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <ul className="flex items-center space-x-2">
            {filteredNavLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className="flex items-center px-2 py-2 sm:px-3 rounded-md hover:bg-white hover:text-senai-red transition-colors"
                >
                  {link.icon}
                  <span className="hidden sm:inline ml-1">{link.label}</span>
                </Link>
              </li>
            ))}
             <li>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-white hover:text-senai-red transition-colors"
                    aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
            </li>
            {user ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md bg-senai-yellow text-senai-gray hover:bg-opacity-80 transition-colors"
                >
                  <LogoutIcon />
                  <span className="hidden sm:inline ml-1">{TEXT_LOGOUT}</span>
                  <span className="hidden lg:inline ml-1 text-xs">({user.name.split(' ')[0]} - {user.role})</span>
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="flex items-center px-3 py-2 rounded-md bg-senai-yellow text-senai-gray hover:bg-opacity-80 transition-colors"
                >
                  <LoginIcon />
                  <span className="hidden sm:inline ml-1">{TEXT_LOGIN}</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-white hover:text-senai-red transition-colors"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-senai-red shadow-lg z-40 border-t border-red-400">
          <nav>
            <ul className="flex flex-col px-2 pt-2 pb-3 space-y-1">
              {filteredNavLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-3 rounded-md hover:bg-white hover:text-senai-red transition-colors w-full text-left"
                  >
                    {link.icon && <span className="mr-2">{link.icon}</span>}
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full px-3 py-3 rounded-md hover:bg-white hover:text-senai-red transition-colors"
                    aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    <span className="ml-2">{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                </button>
              </li>
              {user ? (
                <li>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center w-full px-3 py-3 rounded-md bg-senai-yellow text-senai-gray hover:bg-opacity-80 transition-colors text-left"
                  >
                    <LogoutIcon />
                    <span className="ml-2">{TEXT_LOGOUT} ({user.name.split(' ')[0]})</span>
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    to={ROUTES.AUTH.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center w-full px-3 py-3 rounded-md bg-senai-yellow text-senai-gray hover:bg-opacity-80 transition-colors"
                  >
                    <LoginIcon />
                    <span className="ml-2">{TEXT_LOGIN}</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
