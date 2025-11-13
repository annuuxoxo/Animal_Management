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
import { ArrowLeft, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { Animal, AnimalStatus, Gender } from '../types';

interface AnimalRegistryProps {
  onBack: () => void;
}

type AnimalFormState = {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: Gender;
  weightKg: string;
  status: AnimalStatus;
  notes: string;
};

const defaultAnimalForm: AnimalFormState = {
  name: '',
  species: '',
  breed: '',
  age: '0',
  gender: 'Female',
  weightKg: '',
  status: 'Healthy',
  notes: '',
};

const animalStatuses: AnimalStatus[] = ['Healthy', 'Under Care', 'Quarantine', 'Breeding', 'Inactive'];

const sanitizeNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export default function AnimalRegistry({ onBack }: AnimalRegistryProps) {
  const { animals, addAnimal, updateAnimal, deleteAnimal, feedingTasks } = useFacility();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [animalForm, setAnimalForm] = useState<AnimalFormState>(defaultAnimalForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [animalBeingEdited, setAnimalBeingEdited] = useState<Animal | null>(null);
  const [editForm, setEditForm] = useState<AnimalFormState>(defaultAnimalForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [viewAnimal, setViewAnimal] = useState<Animal | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  const filteredAnimals = useMemo(
    () =>
      animals.filter((animal) => {
        const value = searchTerm.trim().toLowerCase();
        if (!value) return true;
        return (
          animal.name.toLowerCase().includes(value) ||
          animal.id.toLowerCase().includes(value) ||
          animal.species.toLowerCase().includes(value) ||
          animal.breed.toLowerCase().includes(value)
        );
      }),
    [animals, searchTerm]
  );

  const speciesBreakdown = useMemo(() => {
    const normalized = animals.reduce(
      (acc, animal) => {
        const species = animal.species.toLowerCase();
        if (species === 'dog' || species === 'canine') {
          acc.dogs += 1;
        } else if (species === 'cat' || species === 'feline') {
          acc.cats += 1;
        } else {
          acc.other += 1;
        }
        return acc;
      },
      { dogs: 0, cats: 0, other: 0 }
    );
    return normalized;
  }, [animals]);

  const activeFeedingTasks = useMemo(
    () => feedingTasks.filter((task) => task.status !== 'Completed').length,
    [feedingTasks]
  );

  const resetAddForm = () => {
    setAnimalForm(defaultAnimalForm);
    setFormError(null);
  };

  const validateForm = (form: AnimalFormState, setError: (msg: string | null) => void) => {
    if (!form.name.trim()) {
      setError('Animal name is required.');
      return false;
    }
    if (!form.species.trim()) {
      setError('Species is required.');
      return false;
    }
    if (!form.breed.trim()) {
      setError('Breed is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddAnimal = () => {
    if (!validateForm(animalForm, setFormError)) {
      return;
    }

    addAnimal({
      name: animalForm.name.trim(),
      species: animalForm.species.trim(),
      breed: animalForm.breed.trim(),
      age: sanitizeNumber(animalForm.age),
      gender: animalForm.gender,
      weightKg: animalForm.weightKg.trim() ? sanitizeNumber(animalForm.weightKg) : undefined,
      status: animalForm.status,
      notes: animalForm.notes.trim() ? animalForm.notes.trim() : undefined,
    });

    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const handleEditClick = (animal: Animal) => {
    setAnimalBeingEdited(animal);
    setEditForm({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age: String(animal.age ?? 0),
      gender: animal.gender,
      weightKg: animal.weightKg ? String(animal.weightKg) : '',
      status: animal.status,
      notes: animal.notes ?? '',
    });
    setEditError(null);
  };

  const handleUpdateAnimal = () => {
    if (!animalBeingEdited) return;
    if (!validateForm(editForm, setEditError)) {
      return;
    }

    updateAnimal(animalBeingEdited.id, {
      name: editForm.name.trim(),
      species: editForm.species.trim(),
      breed: editForm.breed.trim(),
      age: sanitizeNumber(editForm.age),
      gender: editForm.gender,
      status: editForm.status,
      weightKg: editForm.weightKg.trim() ? sanitizeNumber(editForm.weightKg) : undefined,
      notes: editForm.notes.trim() ? editForm.notes.trim() : undefined,
    });

    setAnimalBeingEdited(null);
  };

  const statusVariant = (status: AnimalStatus) => {
    switch (status) {
      case 'Healthy':
        return 'default';
      case 'Under Care':
        return 'secondary';
      case 'Breeding':
        return 'outline';
      case 'Quarantine':
      case 'Inactive':
        return 'destructive';
      default:
        return 'secondary';
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
            <h1 className="text-white text-3xl">🐕 Animal Registry</h1>
            <p className="text-white/80">Manage and track all animals in the facility.</p>
            <p className="text-white/70 text-sm">
              Active feeding tasks pending: {activeFeedingTasks}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, species, or breed..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetAddForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Animal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Total Animals</CardDescription>
              <CardTitle className="text-2xl">{animals.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Dogs</CardDescription>
              <CardTitle className="text-2xl">{speciesBreakdown.dogs}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Cats</CardDescription>
              <CardTitle className="text-2xl">{speciesBreakdown.cats}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Other Species</CardDescription>
              <CardTitle className="text-2xl">{speciesBreakdown.other}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Animals Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>All Animals</CardTitle>
            <CardDescription>Complete registry of animals in the facility</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[90px]">ID</TableHead>
                  <TableHead className="min-w-[160px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Species</TableHead>
                  <TableHead className="min-w-[160px]">Breed</TableHead>
                  <TableHead className="min-w-[80px]">Age</TableHead>
                  <TableHead className="min-w-[110px]">Gender</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map((animal) => (
                  <TableRow key={animal.id} className="hover:bg-emerald-50/40">
                    <TableCell>{animal.id}</TableCell>
                    <TableCell>{animal.name}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed}</TableCell>
                    <TableCell>{animal.age} yrs</TableCell>
                    <TableCell>{animal.gender}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(animal.status) as any}>{animal.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewAnimal(animal)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(animal)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setAnimalToDelete(animal)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAnimals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No animals match the current filters.
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
            <DialogTitle>Add New Animal</DialogTitle>
            <DialogDescription>Enter the details of the new animal</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="animal-name">Name</Label>
              <Input
                id="animal-name"
                placeholder="Enter animal name"
                value={animalForm.name}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animal-species">Species</Label>
              <Input
                id="animal-species"
                placeholder="e.g., Dog"
                value={animalForm.species}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, species: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animal-breed">Breed</Label>
              <Input
                id="animal-breed"
                placeholder="e.g., Golden Retriever"
                value={animalForm.breed}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, breed: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="animal-age">Age (years)</Label>
              <Input
                id="animal-age"
                type="number"
                min={0}
                value={animalForm.age}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, age: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={animalForm.gender} onValueChange={(value) => setAnimalForm((prev) => ({ ...prev, gender: value as Gender }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="animal-weight">Weight (kg)</Label>
              <Input
                id="animal-weight"
                type="number"
                min={0}
                step="0.1"
                value={animalForm.weightKg}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, weightKg: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={animalForm.status} onValueChange={(value) => setAnimalForm((prev) => ({ ...prev, status: value as AnimalStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {animalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="animal-notes">Notes</Label>
              <Textarea
                id="animal-notes"
                placeholder="Additional details or observations"
                value={animalForm.notes}
                onChange={(event) => setAnimalForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddAnimal}>
              Save Animal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(animalBeingEdited)} onOpenChange={(open) => !open && setAnimalBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Animal Details</DialogTitle>
            <DialogDescription>Update information for {animalBeingEdited?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-animal-name">Name</Label>
              <Input
                id="edit-animal-name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-animal-species">Species</Label>
              <Input
                id="edit-animal-species"
                value={editForm.species}
                onChange={(event) => setEditForm((prev) => ({ ...prev, species: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-animal-breed">Breed</Label>
              <Input
                id="edit-animal-breed"
                value={editForm.breed}
                onChange={(event) => setEditForm((prev) => ({ ...prev, breed: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-animal-age">Age (years)</Label>
              <Input
                id="edit-animal-age"
                type="number"
                min={0}
                value={editForm.age}
                onChange={(event) => setEditForm((prev) => ({ ...prev, age: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={editForm.gender} onValueChange={(value) => setEditForm((prev) => ({ ...prev, gender: value as Gender }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-animal-weight">Weight (kg)</Label>
              <Input
                id="edit-animal-weight"
                type="number"
                min={0}
                step="0.1"
                value={editForm.weightKg}
                onChange={(event) => setEditForm((prev) => ({ ...prev, weightKg: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as AnimalStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {animalStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-animal-notes">Notes</Label>
              <Textarea
                id="edit-animal-notes"
                value={editForm.notes}
                onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAnimalBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateAnimal}>
              Update Animal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={Boolean(viewAnimal)} onOpenChange={(open) => !open && setViewAnimal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Animal Details</DialogTitle>
            <DialogDescription>ID: {viewAnimal?.id}</DialogDescription>
          </DialogHeader>
          {viewAnimal && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewAnimal.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Species</p>
                  <p className="font-medium">{viewAnimal.species}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Breed</p>
                  <p className="font-medium">{viewAnimal.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{viewAnimal.age} yrs</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{viewAnimal.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusVariant(viewAnimal.status) as any}>{viewAnimal.status}</Badge>
                </div>
              </div>
              {viewAnimal.weightKg !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{viewAnimal.weightKg} kg</p>
                </div>
              )}
              {viewAnimal.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{viewAnimal.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewAnimal(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(animalToDelete)} onOpenChange={(open) => !open && setAnimalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove animal from registry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove {animalToDelete?.name} ({animalToDelete?.id}) and all associated feeding and health tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (animalToDelete) {
                  deleteAnimal(animalToDelete.id);
                }
                setAnimalToDelete(null);
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

