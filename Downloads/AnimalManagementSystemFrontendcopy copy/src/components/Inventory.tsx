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
import { Progress } from './ui/progress';
import { ArrowLeft, Plus, Search, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { InventoryItem } from '../types';

interface InventoryProps {
  onBack: () => void;
}

type InventoryForm = {
  name: string;
  category: InventoryItem['category'];
  quantity: string;
  unit: string;
  reorderLevel: string;
  costPerUnit: string;
};

const categories: InventoryItem['category'][] = ['Food', 'Medicine', 'Equipment', 'Supplies'];

const defaultForm: InventoryForm = {
  name: '',
  category: 'Food',
  quantity: '0',
  unit: '',
  reorderLevel: '0',
  costPerUnit: '0',
};

const parseNumber = (value: string, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function Inventory({ onBack }: InventoryProps) {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useFacility();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | InventoryItem['category']>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<InventoryForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [itemBeingEdited, setItemBeingEdited] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<InventoryForm>(defaultForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const filteredInventory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!term) return true;
      return (
        item.id.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    });
  }, [inventory, searchTerm, categoryFilter]);

  const monthlyBudget = 50000;

  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const lowStock = inventory.filter((item) => item.status !== 'In Stock').length;
    const foodValue = inventory.filter((item) => item.category === 'Food').reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const medicineValue = inventory.filter((item) => item.category === 'Medicine').reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const equipmentValue = inventory.filter((item) => item.category === 'Equipment').reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const budgetUsed = (totalValue / monthlyBudget) * 100;
    return { totalItems: inventory.length, totalValue, lowStock, foodValue, medicineValue, equipmentValue, budgetUsed, remaining: monthlyBudget - totalValue };
  }, [inventory]);

  const resetForm = () => {
    setForm(defaultForm);
    setFormError(null);
  };

  const validateForm = (data: InventoryForm, setError: (msg: string | null) => void) => {
    if (!data.name.trim()) {
      setError('Item name is required.');
      return false;
    }
    if (!data.unit.trim()) {
      setError('Unit is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddItem = () => {
    if (!validateForm(form, setFormError)) return;
    addInventoryItem({
      name: form.name.trim(),
      category: form.category,
      quantity: parseNumber(form.quantity),
      unit: form.unit.trim(),
      reorderLevel: parseNumber(form.reorderLevel),
      costPerUnit: parseNumber(form.costPerUnit),
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (item: InventoryItem) => {
    setItemBeingEdited(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      costPerUnit: String(item.costPerUnit),
    });
    setEditError(null);
  };

  const handleUpdateItem = () => {
    if (!itemBeingEdited) return;
    if (!validateForm(editForm, setEditError)) return;

    updateInventoryItem(itemBeingEdited.id, {
      name: editForm.name.trim(),
      category: editForm.category,
      quantity: parseNumber(editForm.quantity),
      unit: editForm.unit.trim(),
      reorderLevel: parseNumber(editForm.reorderLevel),
      costPerUnit: parseNumber(editForm.costPerUnit),
    });

    setItemBeingEdited(null);
  };

  const statusBadgeVariant = (status: InventoryItem['status']) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Low Stock':
        return 'secondary';
      case 'Out of Stock':
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
            <h1 className="text-white text-3xl">📦 Inventory Management</h1>
            <p className="text-white/80">Track facility supplies, medicine, and equipment.</p>
            <p className="text-white/70 text-sm">Low stock alerts: {stats.lowStock}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as 'ALL' | InventoryItem['category'])}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name or ID"
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
                Add Inventory Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <CardDescription>Total Items</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.totalItems}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <CardDescription>Total Value</CardDescription>
              </div>
              <CardTitle className="text-2xl text-emerald-600">${stats.totalValue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <CardDescription>Low Stock Items</CardDescription>
              </div>
              <CardTitle className="text-2xl text-orange-600">{stats.lowStock}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Monthly Budget</CardDescription>
              <CardTitle className="text-2xl">${monthlyBudget.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Budget Utilization */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Current inventory value vs monthly budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Used: ${stats.totalValue.toLocaleString()}</span>
                <span className="text-sm font-medium">Remaining: ${stats.remaining.toLocaleString()}</span>
              </div>
              <Progress value={stats.budgetUsed} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">{stats.budgetUsed.toFixed(1)}% of budget utilized</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Food Budget</span>
                </div>
                <p className="text-2xl font-semibold text-emerald-800">${stats.foodValue.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Medicine Budget</span>
                </div>
                <p className="text-2xl font-semibold text-blue-800">${stats.medicineValue.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-center gap-2 text-purple-700 mb-2">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-medium">Equipment Budget</span>
                </div>
                <p className="text-2xl font-semibold text-purple-800">${stats.equipmentValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>All facility supplies and stock levels</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Cost/Unit</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-emerald-50/40">
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.reorderLevel} {item.unit}</TableCell>
                    <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                    <TableCell>${(item.costPerUnit * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status) as any}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setItemToDelete(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No inventory items match the current filters.
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
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Register a new supply, medicine, or equipment</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g., Premium Dog Food" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value as InventoryItem['category'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={0} value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))} placeholder="e.g., kg, bottles" />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input type="number" min={0} value={form.reorderLevel} onChange={(event) => setForm((prev) => ({ ...prev, reorderLevel: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cost per Unit ($)</Label>
              <Input type="number" min={0} step="0.01" value={form.costPerUnit} onChange={(event) => setForm((prev) => ({ ...prev, costPerUnit: event.target.value }))} />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddItem}>
              Save Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(itemBeingEdited)} onOpenChange={(open) => !open && setItemBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update stock levels or pricing</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value as InventoryItem['category'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min={0} value={editForm.quantity} onChange={(event) => setEditForm((prev) => ({ ...prev, quantity: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={editForm.unit} onChange={(event) => setEditForm((prev) => ({ ...prev, unit: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input type="number" min={0} value={editForm.reorderLevel} onChange={(event) => setEditForm((prev) => ({ ...prev, reorderLevel: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cost per Unit ($)</Label>
              <Input type="number" min={0} step="0.01" value={editForm.costPerUnit} onChange={(event) => setEditForm((prev) => ({ ...prev, costPerUnit: event.target.value }))} />
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setItemBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateItem}>
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inventory item?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the item from the inventory list.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (itemToDelete) {
                  deleteInventoryItem(itemToDelete.id);
                }
                setItemToDelete(null);
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

