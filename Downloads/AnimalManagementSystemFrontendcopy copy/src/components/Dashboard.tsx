import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Home,
  PawPrint,
  Heart,
  UtensilsCrossed,
  Baby,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import type { Page } from '../App';
import { useFacility } from '../context/FacilityContext';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userEmail?: string;
}

const modules = [
  {
    id: 'animals' as Page,
    icon: PawPrint,
    title: 'Animal Registry',
    description: 'Add/Edit/View animal details',
    color: 'bg-emerald-500',
    action: 'Manage Animals'
  },
  {
    id: 'health' as Page,
    icon: Heart,
    title: 'Health Records',
    description: 'Track vaccinations & treatments',
    color: 'bg-green-600',
    action: 'View Records'
  },
  {
    id: 'feeding' as Page,
    icon: UtensilsCrossed,
    title: 'Feeding Schedule',
    description: 'Manage feeding times & portions',
    color: 'bg-lime-600',
    action: 'Schedule Feeding'
  },
  {
    id: 'breeding' as Page,
    icon: Baby,
    title: 'Breeding Management',
    description: 'Track mating & due dates',
    color: 'bg-teal-600',
    action: 'Manage Breeding'
  },
  {
    id: 'inventory' as Page,
    icon: Package,
    title: 'Inventory',
    description: 'Track supplies & equipment',
    color: 'bg-emerald-700',
    action: 'View Inventory'
  },
  {
    id: 'staff' as Page,
    icon: Users,
    title: 'Staff Management',
    description: 'Manage team & roles',
    color: 'bg-green-700',
    action: 'Manage Staff'
  },
  {
    id: 'reports' as Page,
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Generate insights & summaries',
    color: 'bg-lime-700',
    action: 'View Reports'
  },
  {
    id: 'settings' as Page,
    icon: SettingsIcon,
    title: 'Settings',
    description: 'Facility details & preferences',
    color: 'bg-teal-700',
    action: 'Configure'
  }
];

export default function Dashboard({ onNavigate, onLogout, userEmail }: DashboardProps) {
  const { animals, staff, feedingTasks, inventory, healthRecords, breedingRecords } = useFacility();

  const totalAnimals = animals.length;
  const activeStaff = staff.filter((member) => member.status === 'Active');
  const pendingFeeding = feedingTasks.filter((task) => task.status === 'Pending');
  const completedFeeding = feedingTasks.filter((task) => task.status === 'Completed');
  const lowStockItems = inventory.filter((item) => item.status !== 'In Stock');
  const openHealthRecords = healthRecords.filter((record) => record.status !== 'Completed');
  const activePregnancies = breedingRecords.filter((record) => record.status === 'Pregnant').length;

  const alertCount = pendingFeeding.length + lowStockItems.length + openHealthRecords.length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Home className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-white text-4xl">Dashboard</h1>
                <p className="text-white/80 mt-1">Welcome to the Animal Management System</p>
              </div>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div>
                <p className="text-white/70 text-sm">Signed in as</p>
                <p className="text-white text-base font-medium">{userEmail ?? 'Team Member'}</p>
              </div>
              <Button variant="outline" className="mt-9 sm:mt-0 border-white/40 text-black hover:bg-white/20" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription>Total Animals</CardDescription>
              <CardTitle className="text-3xl text-emerald-700">{totalAnimals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">{completedFeeding.length} meals completed today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription>Active Staff</CardDescription>
              <CardTitle className="text-3xl text-green-700">{activeStaff.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeStaff.filter((member) => member.role === 'Veterinarian').length} Vets
                </Badge>
                <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                  {activeStaff.filter((member) => member.role === 'Caretaker').length} Caretakers
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription>Pending Alerts</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{alertCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{pendingFeeding.length} feedings • {openHealthRecords.length} health • {lowStockItems.length} stock</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border-none shadow-xl">
            <CardHeader className="pb-3">
              <CardDescription>Today's Feeding Tasks</CardDescription>
              <CardTitle className="text-3xl text-lime-700">{feedingTasks.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {completedFeeding.length} completed • {pendingFeeding.length} pending
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="space-y-4">
          <h2 className="text-white text-2xl">System Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card 
                  key={module.id}
                  className="bg-white/95 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => onNavigate(module.id)}
                >
                  <CardHeader>
                    <div className={`${module.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group-hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(module.id);
                      }}
                    >
                      {module.action}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-white/70 text-sm text-center">
            💡 {activePregnancies} active pregnancies • {lowStockItems.length} low-stock alerts • {pendingFeeding.length} feedings waiting for completion
          </p>
        </div>
      </div>
    </div>
  );
}
