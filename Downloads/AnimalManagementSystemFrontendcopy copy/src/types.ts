export type Gender = 'Male' | 'Female' | 'Unknown';

export type AnimalStatus = 'Healthy' | 'Under Care' | 'Quarantine' | 'Breeding' | 'Inactive';

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: Gender;
  weightKg?: number;
  status: AnimalStatus;
  notes?: string;
}

export type HealthRecordType = 'Vaccination' | 'Treatment' | 'Checkup' | 'Medication' | 'Surgery';
export type HealthRecordStatus = 'Scheduled' | 'Ongoing' | 'Completed';

export interface HealthRecord {
  id: string;
  animalId: string;
  recordType: HealthRecordType;
  description: string;
  date: string;
  veterinarian: string;
  status: HealthRecordStatus;
  nextDueDate?: string;
  notes?: string;
}

export type FeedingStatus = 'Pending' | 'Completed' | 'Missed';

export interface FeedingTask {
  id: string;
  animalId: string;
  animalName: string;
  foodType: string;
  quantity: string;
  time: string;
  frequency: 'Daily' | 'Twice Daily' | 'Weekly' | 'Custom';
  status: FeedingStatus;
  startDate: string;
}

export type BreedingStatus = 'Pregnant' | 'Delivered' | 'Unsuccessful';

export interface BreedingRecord {
  id: string;
  motherId: string;
  fatherId: string;
  matingDate: string;
  dueDate: string;
  expectedLitter?: string;
  actualLitter?: string;
  status: BreedingStatus;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Food' | 'Medicine' | 'Equipment' | 'Supplies';
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

export interface StaffMember {
  id: string;
  name: string;
  role: 'Veterinarian' | 'Caretaker' | 'Manager' | 'Assistant' | 'Support';
  email: string;
  phone: string;
  status: StaffStatus;
  joined: string;
  notes?: string;
}

export interface FacilitySettings {
  facilityName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  notificationPreferences: {
    lowStockAlerts: boolean;
    healthReminders: boolean;
    breedingAlerts: boolean;
    feedingReminders: boolean;
    emailSummary: boolean;
  };
  lastBackup: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userEmail?: string;
}

export interface ReportFilters {
  timeRange: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  reportType: 'All' | 'Animals' | 'Health' | 'Inventory' | 'Breeding' | 'Financial';
}

