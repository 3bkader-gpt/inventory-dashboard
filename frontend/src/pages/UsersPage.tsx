import { useEffect, useState } from 'react';
import { Plus, UserX, Users, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usersApi } from '@/api/users';
import { formatDate, cn } from '@/lib/utils';
import type { User, UserCreateInput, UserRole } from '@/types';

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<UserCreateInput>({
        email: '',
        full_name: '',
        password: '',
        role: 'staff',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersApi.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenForm = () => {
        setFormData({
            email: '',
            full_name: '',
            password: '',
            role: 'staff',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await usersApi.create(formData);
            setIsFormOpen(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (id: number) => {
        if (confirm('Are you sure you want to deactivate this user?')) {
            try {
                await usersApi.deactivate(id);
                loadUsers();
            } catch (error) {
                console.error('Failed to deactivate user:', error);
            }
        }
    };

    const handleReactivate = async (id: number) => {
        try {
            await usersApi.update(id, { is_active: true });
            loadUsers();
        } catch (error) {
            console.error('Failed to reactivate user:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Users</h1>
                <Button onClick={handleOpenForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Members ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No users found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-muted-foreground">
                                        <th className="pb-3 font-medium">User</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium">Role</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Joined</th>
                                        <th className="pb-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50">
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                        {user.role === 'admin' ? (
                                                            <Shield className="h-5 w-5 text-primary" />
                                                        ) : (
                                                            <UserIcon className="h-5 w-5 text-primary" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{user.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{user.email}</td>
                                            <td className="py-3">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-1 text-xs font-medium',
                                                        user.role === 'admin'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground'
                                                    )}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-1 text-xs font-medium',
                                                        user.is_active
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-destructive/10 text-destructive'
                                                    )}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="py-3 text-right">
                                                {user.is_active ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(user.id)}
                                                    >
                                                        <UserX className="mr-1 h-4 w-4" />
                                                        Deactivate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReactivate(user.id)}
                                                    >
                                                        Reactivate
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add User</DialogTitle>
                        <DialogDescription>
                            Create a new team member account.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, full_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: UserRole) =>
                                    setFormData({ ...formData, role: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
