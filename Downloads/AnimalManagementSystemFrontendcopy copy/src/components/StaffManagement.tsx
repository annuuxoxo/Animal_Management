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
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, Plus, Search, Users, Stethoscope, HeartHandshake, UserCheck, Edit, Trash2 } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { StaffMember, StaffStatus } from '../types';

interface StaffManagementProps {
  onBack: () => void;
}

type StaffForm = {
  name: string;
  role: StaffMember['role'];
  email: string;
  phone: string;
  joined: string;
  status: StaffStatus;
};

const roles: StaffMember['role'][] = ['Veterinarian', 'Caretaker', 'Manager', 'Assistant', 'Support'];
const statuses: StaffStatus[] = ['Active', 'On Leave', 'Inactive'];

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultForm: StaffForm = {
  name: '',
  role: 'Veterinarian',
  email: '',
  phone: '',
  joined: todayIso(),
  status: 'Active',
};

export default function StaffManagement({ onBack }: StaffManagementProps) {
  const { staff, addStaffMember, updateStaffMember, deleteStaffMember } = useFacility();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | StaffMember['role']>('ALL');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [memberBeingEdited, setMemberBeingEdited] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState<StaffForm>(defaultForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
      if (!matchesRole) return false;
      if (!term) return true;
      return (
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.id.toLowerCase().includes(term)
      );
    });
  }, [staff, searchTerm, roleFilter]);

  const stats = useMemo(() => {
    const veterinarians = staff.filter((member) => member.role === 'Veterinarian' && member.status === 'Active').length;
    const caretakers = staff.filter((member) => member.role === 'Caretaker' && member.status === 'Active').length;
    const managers = staff.filter((member) => member.role === 'Manager' && member.status === 'Active').length;
    const active = staff.filter((member) => member.status === 'Active').length;
    return { active, veterinarians, caretakers, managers };
  }, [staff]);

  const resetForm = () => {
    setForm(defaultForm);
    setFormError(null);
  };

  const validateForm = (data: StaffForm, setError: (msg: string | null) => void) => {
    if (!data.name.trim()) {
      setError('Full name is required.');
      return false;
    }
    if (!data.email.trim()) {
      setError('Email is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddMember = () => {
    if (!validateForm(form, setFormError)) return;
    addStaffMember({
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      joined: form.joined,
      status: form.status,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditClick = (member: StaffMember) => {
    setMemberBeingEdited(member);
    setEditForm({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      joined: member.joined,
      status: member.status,
    });
    setEditError(null);
  };

  const handleUpdateMember = () => {
    if (!memberBeingEdited) return;
    if (!validateForm(editForm, setEditError)) return;

    updateStaffMember(memberBeingEdited.id, {
      name: editForm.name.trim(),
      role: editForm.role,
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      joined: editForm.joined,
      status: editForm.status,
    });

    setMemberBeingEdited(null);
  };

  const statusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'On Leave':
        return 'secondary';
      case 'Inactive':
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
            <h1 className="text-white text-3xl">👥 Staff Management</h1>
            <p className="text-white/80">Manage team members, roles, and their availability.</p>
            <p className="text-white/70 text-sm">Active staff: {stats.active}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'ALL' | StaffMember['role'])}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or ID"
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
                Add Staff Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardDescription>Total Staff</CardDescription>
              </div>
              <CardTitle className="text-2xl">{staff.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <CardDescription>Veterinarians</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.veterinarians}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                <CardDescription>Caretakers</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.caretakers}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-600" />
                <CardDescription>Managers</CardDescription>
              </div>
              <CardTitle className="text-2xl">{stats.managers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>All team members and their roles</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => {
                  const initials = member.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('');
                  return (
                    <TableRow key={member.id} className="hover:bg-emerald-50/40">
                      <TableCell>{member.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {initials || 'N/A'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            member.role === 'Veterinarian'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : member.role === 'Caretaker'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : member.role === 'Manager'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.joined}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(member.status) as any}>{member.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(member)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setMemberToDelete(member)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredStaff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No staff members match the current filters.
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
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Add a new team member to the facility</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as StaffMember['role'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="email@facility.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="555-0000" />
            </div>
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input type="date" value={form.joined} onChange={(event) => setForm((prev) => ({ ...prev, joined: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as StaffStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddMember}>
              Save Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(memberBeingEdited)} onOpenChange={(open) => !open && setMemberBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff details and status</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value as StaffMember['role'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Join Date</Label>
              <Input type="date" value={editForm.joined} onChange={(event) => setEditForm((prev) => ({ ...prev, joined: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as StaffStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setMemberBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateMember}>
              Update Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(memberToDelete)} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove staff member?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the staff member from the roster.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (memberToDelete) {
                  deleteStaffMember(memberToDelete.id);
                }
                setMemberToDelete(null);
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

