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
import { ArrowLeft, Plus, Search, Clock3, CheckCircle2, XCircle, CalendarDays, Edit, Trash2 } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { FeedingStatus, FeedingTask } from '../types';

interface FeedingScheduleProps {
  onBack: () => void;
}

type FeedingForm = {
  animalId: string;
  foodType: string;
  time: string;
  quantity: string;
  frequency: FeedingTask['frequency'];
  status: FeedingStatus;
  startDate: string;
};

const feedingFrequencies: FeedingTask['frequency'][] = ['Daily', 'Twice Daily', 'Weekly', 'Custom'];
const feedingStatuses: FeedingStatus[] = ['Pending', 'Completed', 'Missed'];

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultForm: FeedingForm = {
  animalId: '',
  foodType: '',
  time: '08:00',
  quantity: '',
  frequency: 'Daily',
  status: 'Pending',
  startDate: todayIso(),
};

export default function FeedingSchedule({ onBack }: FeedingScheduleProps) {
  const { animals, feedingTasks, addFeedingTask, updateFeedingTask, deleteFeedingTask } = useFacility();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FeedingStatus>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<FeedingForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [taskBeingEdited, setTaskBeingEdited] = useState<FeedingTask | null>(null);
  const [editForm, setEditForm] = useState<FeedingForm>(defaultForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<FeedingTask | null>(null);

  const animalsById = useMemo(() => new Map(animals.map((animal) => [animal.id, animal])), [animals]);

  const filteredTasks = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();
    return feedingTasks.filter((task) => {
      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      if (!matchesStatus) return false;
      if (!value) return true;
      const animal = animalsById.get(task.animalId);
      return (
        task.id.toLowerCase().includes(value) ||
        task.animalName.toLowerCase().includes(value) ||
        task.foodType.toLowerCase().includes(value) ||
        task.frequency.toLowerCase().includes(value) ||
        (animal && animal.species.toLowerCase().includes(value))
      );
    });
  }, [feedingTasks, searchTerm, statusFilter, animalsById]);

  const stats = useMemo(() => {
    return {
      total: feedingTasks.length,
      completed: feedingTasks.filter((task) => task.status === 'Completed').length,
      pending: feedingTasks.filter((task) => task.status === 'Pending').length,
      missed: feedingTasks.filter((task) => task.status === 'Missed').length,
    };
  }, [feedingTasks]);

  const resetForm = () => {
    setForm({ ...defaultForm });
    setFormError(null);
  };

  const validateForm = (data: FeedingForm, setError: (msg: string | null) => void) => {
    if (!data.animalId) {
      setError('Select an animal for this feeding task.');
      return false;
    }
    if (!data.foodType.trim()) {
      setError('Food type is required.');
      return false;
    }
    if (!data.quantity.trim()) {
      setError('Quantity is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddTask = () => {
    if (!validateForm(form, setFormError)) return;
    const animal = animalsById.get(form.animalId);
    if (!animal) {
      setFormError('Invalid animal selected.');
      return;
    }

    addFeedingTask({
      animalId: form.animalId,
      animalName: animal.name,
      foodType: form.foodType.trim(),
      time: form.time,
      quantity: form.quantity.trim(),
      frequency: form.frequency,
      status: form.status,
      startDate: form.startDate,
    });

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (task: FeedingTask) => {
    setTaskBeingEdited(task);
    setEditForm({
      animalId: task.animalId,
      foodType: task.foodType,
      time: task.time,
      quantity: task.quantity,
      frequency: task.frequency,
      status: task.status,
      startDate: task.startDate,
    });
    setEditError(null);
  };

  const handleUpdateTask = () => {
    if (!taskBeingEdited) return;
    if (!validateForm(editForm, setEditError)) return;
    const animal = animalsById.get(editForm.animalId);
    if (!animal) {
      setEditError('Invalid animal selected.');
      return;
    }

    updateFeedingTask(taskBeingEdited.id, {
      animalId: editForm.animalId,
      animalName: animal.name,
      foodType: editForm.foodType.trim(),
      time: editForm.time,
      quantity: editForm.quantity.trim(),
      frequency: editForm.frequency,
      status: editForm.status,
      startDate: editForm.startDate,
    });

    setTaskBeingEdited(null);
  };

  const toggleStatus = (task: FeedingTask) => {
    const nextStatus: FeedingStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateFeedingTask(task.id, { status: nextStatus });
  };

  const statusBadgeVariant = (status: FeedingStatus) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Missed':
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
            <h1 className="text-white text-3xl">🍖 Feeding Schedule</h1>
            <p className="text-white/80">Manage feeding times, portions, and frequencies.</p>
            <p className="text-white/70 text-sm">Pending tasks: {stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | FeedingStatus)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    {feedingStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by animal, food, or frequency"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feeding Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-blue-600" />
                <CardDescription>Total Tasks</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardDescription>Completed</CardDescription>
              </div>
              <CardTitle className="text-2xl text-emerald-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-600" />
                <CardDescription>Pending</CardDescription>
              </div>
              <CardTitle className="text-2xl text-orange-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                <CardDescription>Missed</CardDescription>
              </div>
              <CardTitle className="text-2xl text-purple-600">{stats.missed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Feeding Tasks</CardTitle>
            <CardDescription>Daily schedules and routines</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Food Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-emerald-50/40">
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.animalId} - {task.animalName}</TableCell>
                    <TableCell>{task.foodType}</TableCell>
                    <TableCell>{task.time}</TableCell>
                    <TableCell>{task.quantity}</TableCell>
                    <TableCell>{task.frequency}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(task.status) as any}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>{task.startDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(task)}>
                          {task.status === 'Completed' ? 'Undo' : 'Mark Done'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(task)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setTaskToDelete(task)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No feeding tasks match the current filters.
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
            <DialogTitle>Add Feeding Task</DialogTitle>
            <DialogDescription>Schedule a feeding routine for an animal</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Animal</Label>
              <Select value={form.animalId} onValueChange={(value) => setForm((prev) => ({ ...prev, animalId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Food Type</Label>
              <Input value={form.foodType} onChange={(event) => setForm((prev) => ({ ...prev, foodType: event.target.value }))} placeholder="e.g., Premium Dog Food" />
            </div>
            <div className="space-y-2">
              <Label>Feeding Time</Label>
              <Input type="time" value={form.time} onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))} placeholder="e.g., 500g" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(value) => setForm((prev) => ({ ...prev, frequency: value as FeedingTask['frequency'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {feedingFrequencies.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as FeedingStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {feedingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddTask}>
              Save Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(taskBeingEdited)} onOpenChange={(open) => !open && setTaskBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feeding Task</DialogTitle>
            <DialogDescription>Update feeding information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Animal</Label>
              <Select value={editForm.animalId} onValueChange={(value) => setEditForm((prev) => ({ ...prev, animalId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Food Type</Label>
              <Input value={editForm.foodType} onChange={(event) => setEditForm((prev) => ({ ...prev, foodType: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Feeding Time</Label>
              <Input type="time" value={editForm.time} onChange={(event) => setEditForm((prev) => ({ ...prev, time: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input value={editForm.quantity} onChange={(event) => setEditForm((prev) => ({ ...prev, quantity: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={editForm.frequency} onValueChange={(value) => setEditForm((prev) => ({ ...prev, frequency: value as FeedingTask['frequency'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {feedingFrequencies.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as FeedingStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {feedingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={editForm.startDate} onChange={(event) => setEditForm((prev) => ({ ...prev, startDate: event.target.value }))} />
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTaskBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateTask}>
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(taskToDelete)} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feeding task?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the feeding task from the schedule.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (taskToDelete) {
                  deleteFeedingTask(taskToDelete.id);
                }
                setTaskToDelete(null);
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

