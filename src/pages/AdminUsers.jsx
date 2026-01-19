import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole, useAdminUsers } from '../hooks/useUserRole';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  ShieldCheck, 
  Trash2, 
  Loader2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { users, isLoading, error, fetchUsers, removeUserRole } = useAdminUsers();
  
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [isAdding, setIsAdding] = useState(false);

  // Redirect non-admins
  if (!roleLoading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Åtkomst nekad</CardTitle>
            <CardDescription>
              Du har inte behörighet att se denna sida. Endast administratörer har åtkomst.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_id_by_email', { email_input: newEmail.toLowerCase() });

      if (userError || !userData) {
        // Try to find in auth.users via edge function would be needed
        // For now, show helpful error
        toast.error('Användaren måste först registrera sig i appen');
        setIsAdding(false);
        return;
      }

      // Add role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userData, role: newRole });

      if (roleError) throw roleError;

      toast.success(`${newEmail} har nu rollen ${newRole}`);
      setNewEmail('');
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      toast.error('Kunde inte lägga till användare');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (userId === user?.id) {
      toast.error('Du kan inte ta bort din egen roll');
      return;
    }

    const result = await removeUserRole(userId);
    if (result.success) {
      toast.success('Användarroll borttagen');
    } else {
      toast.error('Kunde inte ta bort användarroll');
    }
  };

  const handleRoleChange = async (userId, newRoleValue) => {
    if (userId === user?.id) {
      toast.error('Du kan inte ändra din egen roll');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRoleValue })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Roll uppdaterad');
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Kunde inte uppdatera roll');
    }
  };

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Användarhantering</h1>
              <p className="text-sm text-muted-foreground">Hantera roller och behörigheter</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka
          </Button>
        </div>

        {/* Add user card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Lägg till roll
            </CardTitle>
            <CardDescription>
              Tilldela en roll till en registrerad användare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="flex gap-3">
              <Input
                type="email"
                placeholder="E-postadress"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Användare</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isAdding || !newEmail.trim()}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lägg till'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Användare med roller
            </CardTitle>
            <CardDescription>
              {users.length} användare har tilldelade roller
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Inga användare med roller ännu</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Användar-ID</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Skapad</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-mono text-xs">
                        {userRole.user_id.slice(0, 8)}...
                        {userRole.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2">Du</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={userRole.role} 
                          onValueChange={(value) => handleRoleChange(userRole.user_id, value)}
                          disabled={userRole.user_id === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Användare
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(userRole.created_at).toLocaleDateString('sv-SE')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveUser(userRole.user_id)}
                          disabled={userRole.user_id === user?.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
