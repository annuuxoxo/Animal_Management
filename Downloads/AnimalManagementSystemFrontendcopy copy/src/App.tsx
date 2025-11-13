import { useState } from 'react';
import LoginPage from './components/LoginPage';
import TitlePage from './components/TitlePage';
import Dashboard from './components/Dashboard';
import AnimalRegistry from './components/AnimalRegistry';
import HealthRecords from './components/HealthRecords';
import FeedingSchedule from './components/FeedingSchedule';
import BreedingManagement from './components/BreedingManagement';
import Inventory from './components/Inventory';
import StaffManagement from './components/StaffManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';

export type Page = 'title' | 'dashboard' | 'animals' | 'health' | 'feeding' | 'breeding' | 'inventory' | 'staff' | 'reports' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('title');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentPage('title');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(undefined);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'title':
        return <TitlePage onEnter={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} onLogout={handleLogout} userEmail={userEmail} />;
      case 'animals':
        return <AnimalRegistry onBack={() => setCurrentPage('dashboard')} />;
      case 'health':
        return <HealthRecords onBack={() => setCurrentPage('dashboard')} />;
      case 'feeding':
        return <FeedingSchedule onBack={() => setCurrentPage('dashboard')} />;
      case 'breeding':
        return <BreedingManagement onBack={() => setCurrentPage('dashboard')} />;
      case 'inventory':
        return <Inventory onBack={() => setCurrentPage('dashboard')} />;
      case 'staff':
        return <StaffManagement onBack={() => setCurrentPage('dashboard')} />;
      case 'reports':
        return <Reports onBack={() => setCurrentPage('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} onLogout={handleLogout} userEmail={userEmail} />;
    }
  };

  return (
    <div className="size-full min-h-screen bg-gradient-to-br from-[#4a7c59] to-[#6b8e23]">
      {renderPage()}
    </div>
  );
}
