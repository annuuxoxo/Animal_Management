import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Animal,
  BreedingRecord,
  FacilitySettings,
  FeedingTask,
  HealthRecord,
  InventoryItem,
  ReportFilters,
  StaffMember,
} from '../types';
import {
  animalsAPI,
  healthRecordsAPI,
  feedingTasksAPI,
  breedingRecordsAPI,
  inventoryAPI,
  staffAPI,
  settingsAPI,
} from '../services/api';

type CreateAnimalInput = Omit<Animal, 'id'>;
type UpdateAnimalInput = Partial<Omit<Animal, 'id'>>;

type CreateHealthRecordInput = Omit<HealthRecord, 'id'>;
type UpdateHealthRecordInput = Partial<Omit<HealthRecord, 'id'>>;

type CreateFeedingTaskInput = Omit<FeedingTask, 'id'>;
type UpdateFeedingTaskInput = Partial<Omit<FeedingTask, 'id'>>;

type CreateBreedingRecordInput = Omit<BreedingRecord, 'id'>;
type UpdateBreedingRecordInput = Partial<Omit<BreedingRecord, 'id'>>;

type CreateInventoryItemInput = Omit<InventoryItem, 'id' | 'status'>;
type UpdateInventoryItemInput = Partial<Omit<InventoryItem, 'id'>>;

type CreateStaffMemberInput = Omit<StaffMember, 'id'>;
type UpdateStaffMemberInput = Partial<Omit<StaffMember, 'id'>>;

interface FacilityContextValue {
  animals: Animal[];
  addAnimal: (payload: CreateAnimalInput) => void;
  updateAnimal: (id: string, payload: UpdateAnimalInput) => void;
  deleteAnimal: (id: string) => void;

  healthRecords: HealthRecord[];
  addHealthRecord: (payload: CreateHealthRecordInput) => void;
  updateHealthRecord: (id: string, payload: UpdateHealthRecordInput) => void;
  deleteHealthRecord: (id: string) => void;

  feedingTasks: FeedingTask[];
  addFeedingTask: (payload: CreateFeedingTaskInput) => void;
  updateFeedingTask: (id: string, payload: UpdateFeedingTaskInput) => void;
  deleteFeedingTask: (id: string) => void;

  breedingRecords: BreedingRecord[];
  addBreedingRecord: (payload: CreateBreedingRecordInput) => void;
  updateBreedingRecord: (id: string, payload: UpdateBreedingRecordInput) => void;
  deleteBreedingRecord: (id: string) => void;

  inventory: InventoryItem[];
  addInventoryItem: (payload: CreateInventoryItemInput) => void;
  updateInventoryItem: (id: string, payload: UpdateInventoryItemInput) => void;
  deleteInventoryItem: (id: string) => void;

  staff: StaffMember[];
  addStaffMember: (payload: CreateStaffMemberInput) => void;
  updateStaffMember: (id: string, payload: UpdateStaffMemberInput) => void;
  deleteStaffMember: (id: string) => void;

  settings: FacilitySettings;
  updateSettings: (payload: Partial<FacilitySettings>) => void;
  updateNotificationPreference: (key: keyof FacilitySettings['notificationPreferences'], value: boolean) => void;

  reportFilters: ReportFilters;
  setReportFilters: (payload: ReportFilters) => void;
}

const FacilityContext = createContext<FacilityContextValue | undefined>(undefined);

const initialReportFilters: ReportFilters = {
  timeRange: 'Monthly',
  reportType: 'All',
};

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [feedingTasks, setFeedingTasks] = useState<FeedingTask[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [settings, setSettings] = useState<FacilitySettings>({
    facilityName: 'Green Valley Animal Care Center',
    registrationNumber: 'FAC-2023-001',
    address: '123 Animal Care Lane, Green Valley, CA 90210',
    phone: '(555) 123-4567',
    email: 'contact@greenvalley.com',
    operatingHours: 'Monday - Saturday: 8:00 AM - 6:00 PM',
    notificationPreferences: {
      lowStockAlerts: true,
      healthReminders: true,
      breedingAlerts: true,
      feedingReminders: true,
      emailSummary: false,
    },
    lastBackup: new Date().toISOString(),
  });
  const [reportFilters, setReportFilters] = useState<ReportFilters>(initialReportFilters);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [animalsData, healthData, feedingData, breedingData, inventoryData, staffData, settingsData] = await Promise.all([
          animalsAPI.getAll().catch(() => []),
          healthRecordsAPI.getAll().catch(() => []),
          feedingTasksAPI.getAll().catch(() => []),
          breedingRecordsAPI.getAll().catch(() => []),
          inventoryAPI.getAll().catch(() => []),
          staffAPI.getAll().catch(() => []),
          settingsAPI.get().catch(() => null),
        ]);

        setAnimals(animalsData);
        setHealthRecords(healthData);
        setFeedingTasks(feedingData);
        setBreedingRecords(breedingData);
        setInventory(inventoryData);
        setStaff(staffData);
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addAnimal = async (payload: CreateAnimalInput) => {
    try {
      const newAnimal = await animalsAPI.create(payload);
      setAnimals((prev) => [...prev, newAnimal]);
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
    }
  };

  const updateAnimal = async (id: string, payload: UpdateAnimalInput) => {
    try {
      const updated = await animalsAPI.update(id, payload);
      setAnimals((prev) => prev.map((animal) => (animal.id === id ? updated : animal)));
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  };

  const deleteAnimal = async (id: string) => {
    try {
      await animalsAPI.delete(id);
      setAnimals((prev) => prev.filter((animal) => animal.id !== id));
      setHealthRecords((prev) => prev.filter((record) => record.animalId !== id));
      setFeedingTasks((prev) => prev.filter((task) => task.animalId !== id));
      setBreedingRecords((prev) => prev.filter((record) => record.motherId !== id && record.fatherId !== id));
    } catch (error) {
      console.error('Error deleting animal:', error);
      throw error;
    }
  };

  const addHealthRecord = async (payload: CreateHealthRecordInput) => {
    try {
      const newRecord = await healthRecordsAPI.create(payload);
      setHealthRecords((prev) => [...prev, newRecord]);
    } catch (error) {
      console.error('Error adding health record:', error);
      throw error;
    }
  };

  const updateHealthRecord = async (id: string, payload: UpdateHealthRecordInput) => {
    try {
      const updated = await healthRecordsAPI.update(id, payload);
      setHealthRecords((prev) => prev.map((record) => (record.id === id ? updated : record)));
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  };

  const deleteHealthRecord = async (id: string) => {
    try {
      await healthRecordsAPI.delete(id);
      setHealthRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error('Error deleting health record:', error);
      throw error;
    }
  };

  const addFeedingTask = async (payload: CreateFeedingTaskInput) => {
    try {
      const newTask = await feedingTasksAPI.create(payload);
      setFeedingTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error('Error adding feeding task:', error);
      throw error;
    }
  };

  const updateFeedingTask = async (id: string, payload: UpdateFeedingTaskInput) => {
    try {
      const updated = await feedingTasksAPI.update(id, payload);
      setFeedingTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch (error) {
      console.error('Error updating feeding task:', error);
      throw error;
    }
  };

  const deleteFeedingTask = async (id: string) => {
    try {
      await feedingTasksAPI.delete(id);
      setFeedingTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting feeding task:', error);
      throw error;
    }
  };

  const addBreedingRecord = async (payload: CreateBreedingRecordInput) => {
    try {
      const newRecord = await breedingRecordsAPI.create(payload);
      setBreedingRecords((prev) => [...prev, newRecord]);
    } catch (error) {
      console.error('Error adding breeding record:', error);
      throw error;
    }
  };

  const updateBreedingRecord = async (id: string, payload: UpdateBreedingRecordInput) => {
    try {
      const updated = await breedingRecordsAPI.update(id, payload);
      setBreedingRecords((prev) => prev.map((record) => (record.id === id ? updated : record)));
    } catch (error) {
      console.error('Error updating breeding record:', error);
      throw error;
    }
  };

  const deleteBreedingRecord = async (id: string) => {
    try {
      await breedingRecordsAPI.delete(id);
      setBreedingRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error('Error deleting breeding record:', error);
      throw error;
    }
  };

  const addInventoryItem = async (payload: CreateInventoryItemInput) => {
    try {
      const newItem = await inventoryAPI.create(payload);
      setInventory((prev) => [...prev, newItem]);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  };

  const updateInventoryItem = async (id: string, payload: UpdateInventoryItemInput) => {
    try {
      const updated = await inventoryAPI.update(id, payload);
      setInventory((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      await inventoryAPI.delete(id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  };

  const addStaffMember = async (payload: CreateStaffMemberInput) => {
    try {
      const newMember = await staffAPI.create(payload);
      setStaff((prev) => [...prev, newMember]);
    } catch (error) {
      console.error('Error adding staff member:', error);
      throw error;
    }
  };

  const updateStaffMember = async (id: string, payload: UpdateStaffMemberInput) => {
    try {
      const updated = await staffAPI.update(id, payload);
      setStaff((prev) => prev.map((member) => (member.id === id ? updated : member)));
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  };

  const deleteStaffMember = async (id: string) => {
    try {
      await staffAPI.delete(id);
      setStaff((prev) => prev.filter((member) => member.id !== id));
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  };

  const updateSettings = async (payload: Partial<FacilitySettings>) => {
    try {
      const updated = await settingsAPI.update(payload);
      setSettings(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const updateNotificationPreference = async (key: keyof FacilitySettings['notificationPreferences'], value: boolean) => {
    try {
      const currentSettings = { ...settings };
      currentSettings.notificationPreferences[key] = value;
      const updated = await settingsAPI.update(currentSettings);
      setSettings(updated);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  };

  const value: FacilityContextValue = {
    animals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    healthRecords,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    feedingTasks,
    addFeedingTask,
    updateFeedingTask,
    deleteFeedingTask,
    breedingRecords,
    addBreedingRecord,
    updateBreedingRecord,
    deleteBreedingRecord,
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    staff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    settings,
    updateSettings,
    updateNotificationPreference,
    reportFilters,
    setReportFilters,
  };

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>;
}

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};

