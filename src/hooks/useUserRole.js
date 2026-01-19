import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        const userRole = data?.role || 'user';
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole('user');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, isAdmin, isLoading };
};

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      setUsers(roles || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = useCallback(async (userId, newRole) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id,role' })
        .select()
        .single();

      if (error) throw error;
      
      await fetchUsers();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating user role:', err);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  const addUserRole = useCallback(async (email, role) => {
    try {
      // First, find the user by email using an edge function or RPC
      // For now, we'll need the user ID directly
      return { success: false, error: 'Use the database to add users by ID' };
    } catch (err) {
      console.error('Error adding user role:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const removeUserRole = useCallback(async (userId) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error('Error removing user role:', err);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
    addUserRole,
    removeUserRole,
  };
};
