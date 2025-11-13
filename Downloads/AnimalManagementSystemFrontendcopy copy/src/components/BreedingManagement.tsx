import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Search, Heart, Baby, CalendarDays, Edit, Trash2 } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { BreedingRecord, BreedingStatus } from '../types';

interface BreedingManagementProps {
  onBack: () => void;
}

type BreedingForm = {
  motherId: string;
  fatherId: string;
  matingDate: string;
  dueDate: string;
  expectedLitter: string;
  actualLitter: string;
  status: BreedingStatus;
  notes: string;
};

const breedingStatuses: BreedingStatus[] = ['Pregnant', 'Delivered', 'Unsuccessful'];

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultForm: BreedingForm = {
  motherId: '',
  fatherId: '',
  matingDate: todayIso(),
  dueDate: '',
  expectedLitter: '',
  actualLitter: '',
  status: 'Pregnant',
  notes: '',
};

const formatDueInDays = (dueDate: string) => {
  if (!dueDate) return '—';
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diff)) return '—';
  if (diff > 0) return `${diff} days`; 
  if (diff === 0) return 'Today';
  return `${Math.abs(diff)} days ago`;
};

export default function BreedingManagement({ onBack }: BreedingManagementProps) {
  const { animals, breedingRecords, addBreedingRecord, updateBreedingRecord, deleteBreedingRecord } = useFacility();

  const femaleAnimals = useMemo(() => animals.filter((animal) => animal.gender === 'Female'), [animals]);
  const maleAnimals = useMemo(() => animals.filter((animal) => animal.gender === 'Male'), [animals]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<BreedingForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [recordBeingEdited, setRecordBeingEdited] = useState<BreedingRecord | null>(null);
  const [editForm, setEditForm] = useState<BreedingForm>(defaultForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<BreedingRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();
    if (!value) return breedingRecords;
    return breedingRecords.filter((record) => {
      const mother = animals.find((animal) => animal.id === record.motherId);
      const father = animals.find((animal) => animal.id === record.fatherId);
      return (
        record.id.toLowerCase().includes(value) ||
        (mother && mother.name.toLowerCase().includes(value)) ||
        (father && father.name.toLowerCase().includes(value)) ||
        record.status.toLowerCase().includes(value)
      );
    });
  }, [breedingRecords, searchTerm, animals]);

  const stats = useMemo(() => {
    const active = breedingRecords.filter((record) => record.status === 'Pregnant');
    const deliveredThisMonth = breedingRecords.filter((record) => {
      if (record.status !== 'Delivered' || !record.dueDate) return false;
      const due = new Date(record.dueDate);
      const now = new Date();
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear();
    });
    const dueSoon = active.filter((record) => {
      if (!record.dueDate) return false;
      const diff = new Date(record.dueDate).getTime() - Date.now();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 14;
    });
    return {
      pregnancies: active.length,
      dueSoon: dueSoon.length,
      delivered: deliveredThisMonth.length,
    };
  }, [breedingRecords]);

  const resetForm = () => {
    setForm({ ...defaultForm });
    setFormError(null);
  };

  const validateForm = (data: BreedingForm, setError: (msg: string | null) => void) => {
    if (!data.motherId) {
      setError('Select a mother.');
      return false;
    }
    if (!data.fatherId) {
      setError('Select a father.');
      return false;
    }
    if (!data.matingDate) {
      setError('Mating date is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddRecord = () => {
    if (!validateForm(form, setFormError)) return;
    addBreedingRecord({
      motherId: form.motherId,
      fatherId: form.fatherId,
      matingDate: form.matingDate,
      dueDate: form.dueDate,
      expectedLitter: form.expectedLitter || undefined,
      actualLitter: form.actualLitter || undefined,
      status: form.status,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (record: BreedingRecord) => {
    setRecordBeingEdited(record);
    setEditForm({
      motherId: record.motherId,
      fatherId: record.fatherId,
      matingDate: record.matingDate,
      dueDate: record.dueDate,
      expectedLitter: record.expectedLitter ?? '',
      actualLitter: record.actualLitter ?? '',
      status: record.status,
      notes: record.notes ?? '',
    });
    setEditError(null);
  };

  const handleUpdateRecord = () => {
    if (!recordBeingEdited) return;
    if (!validateForm(editForm, setEditError)) return;

    updateBreedingRecord(recordBeingEdited.id, {
      motherId: editForm.motherId,
      fatherId: editForm.fatherId,
      matingDate: editForm.matingDate,
      dueDate: editForm.dueDate,
      expectedLitter: editForm.expectedLitter || undefined,
      actualLitter: editForm.actualLitter || undefined,
      status: editForm.status,
      notes: editForm.notes.trim() ? editForm.notes.trim() : undefined,
    });

    setRecordBeingEdited(null);
  };

  const statusVariant = (status: BreedingStatus) => {
    switch (status) {
      case 'Pregnant':
        return 'secondary';
      case 'Delivered':
        return 'default';
      case 'Unsuccessful':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl">👶 Breeding Management</h1>
            <p className="text-white/80">Track mating cycles, due dates, and litter outcomes.</p>
            <p className="text-white/70 text-sm">Active pregnancies: {stats.pregnancies}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by animal, record ID, or status"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Breeding Record
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <CardDescription>Active Pregnancies</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.pregnancies}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <CardDescription>Due Within 14 Days</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.dueSoon}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-600" />
                <CardDescription>Delivered This Month</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.delivered}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Breeding Records</CardTitle>
            <CardDescription>Monitor mating details and status updates</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Mother</TableHead>
                  <TableHead>Father</TableHead>
                  <TableHead>Mating Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Litter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const mother = animals.find((animal) => animal.id === record.motherId);
                  const father = animals.find((animal) => animal.id === record.fatherId);
                  return (
                    <TableRow key={record.id} className="hover:bg-emerald-50/40">
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{record.motherId} - {mother?.name ?? 'Unknown'}</TableCell>
                      <TableCell>{record.fatherId} - {father?.name ?? 'Unknown'}</TableCell>
                      <TableCell>{record.matingDate}</TableCell>
                      <TableCell>{record.dueDate || '—'}</TableCell>
                      <TableCell>{record.status === 'Delivered' ? record.actualLitter ?? '—' : record.expectedLitter ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(record.status) as any}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDueInDays(record.dueDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setRecordToDelete(record)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No breeding records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => (!open ? setIsAddDialogOpen(false) : setIsAddDialogOpen(true))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Breeding Record</DialogTitle>
            <DialogDescription>Log a new breeding cycle</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Mother</Label>
              <Select value={form.motherId} onValueChange={(value) => setForm((prev) => ({ ...prev, motherId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mother" />
                </SelectTrigger>
                <SelectContent>
                  {femaleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Father</Label>
              <Select value={form.fatherId} onValueChange={(value) => setForm((prev) => ({ ...prev, fatherId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select father" />
                </SelectTrigger>
                <SelectContent>
                  {maleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mating Date</Label>
              <Input type="date" value={form.matingDate} onChange={(event) => setForm((prev) => ({ ...prev, matingDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expected Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expected Litter Size</Label>
              <Input value={form.expectedLitter} onChange={(event) => setForm((prev) => ({ ...prev, expectedLitter: event.target.value }))} placeholder="e.g., 4-6" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as BreedingStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {breedingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actual Litter (if delivered)</Label>
              <Input value={form.actualLitter} onChange={(event) => setForm((prev) => ({ ...prev, actualLitter: event.target.value }))} placeholder="e.g., 5" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Add observations or follow-up tasks" />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddRecord}>
              Save Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(recordBeingEdited)} onOpenChange={(open) => !open && setRecordBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Breeding Record</DialogTitle>
            <DialogDescription>Update breeding cycle information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Mother</Label>
              <Select value={editForm.motherId} onValueChange={(value) => setEditForm((prev) => ({ ...prev, motherId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mother" />
                </SelectTrigger>
                <SelectContent>
                  {femaleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Father</Label>
              <Select value={editForm.fatherId} onValueChange={(value) => setEditForm((prev) => ({ ...prev, fatherId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select father" />
                </SelectTrigger>
                <SelectContent>
                  {maleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mating Date</Label>
              <Input type="date" value={editForm.matingDate} onChange={(event) => setEditForm((prev) => ({ ...prev, matingDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={editForm.dueDate} onChange={(event) => setEditForm((prev) => ({ ...prev, dueDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expected Litter</Label>
              <Input value={editForm.expectedLitter} onChange={(event) => setEditForm((prev) => ({ ...prev, expectedLitter: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Actual Litter</Label>
              <Input value={editForm.actualLitter} onChange={(event) => setEditForm((prev) => ({ ...prev, actualLitter: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as BreedingStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {breedingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRecordBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateRecord}>
              Update Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(recordToDelete)} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete breeding record?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the breeding record permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (recordToDelete) {
                  deleteBreedingRecord(recordToDelete.id);
                }
                setRecordToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

