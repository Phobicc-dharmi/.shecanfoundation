import React, { useState } from 'react';
import { User, Donation } from '../types/database';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Target, Edit, Save, X } from 'lucide-react';

interface AdminUsersListProps {
  users: User[];
  donations: Donation[];
  onUpdate: () => void;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ users, donations, onUpdate }) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ fundraising_goal: number; mentor: string }>({ 
    fundraising_goal: 0, 
    mentor: '' 
  });
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'progress'>('progress');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditData({
      fundraising_goal: user.fundraising_goal,
      mentor: user.mentor || '',
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          fundraising_goal: editData.fundraising_goal,
          mentor: editData.mentor || null,
        })
        .eq('id', userId);

      if (error) throw error;
      
      setEditingUser(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditData({ fundraising_goal: 0, mentor: '' });
  };

  const getUserDonations = (userId: string) => {
    return donations.filter(d => d.intern_id === userId);
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.full_name.localeCompare(b.full_name);
      case 'amount':
        return b.current_amount - a.current_amount;
      case 'progress':
        const progressA = (a.current_amount / a.fundraising_goal) * 100;
        const progressB = (b.current_amount / b.fundraising_goal) * 100;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  const filteredUsers = sortedUsers.filter(user => {
    if (filterActive === 'all') return true;
    const hasRecentActivity = getUserDonations(user.id).some(
      d => new Date(d.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return filterActive === 'active' ? hasRecentActivity : !hasRecentActivity;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="progress">Progress</option>
                <option value="amount">Amount Raised</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Interns</option>
                <option value="active">Active (30 days)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} interns
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intern
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current / Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userDonations = getUserDonations(user.id);
                const progress = (user.current_amount / user.fundraising_goal) * 100;
                const isEditing = editingUser === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{user.current_amount.toLocaleString()}</div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.fundraising_goal}
                          onChange={(e) => setEditData(prev => ({ ...prev, fundraising_goal: parseInt(e.target.value) }))}
                          className="mt-1 text-sm w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">₹{user.fundraising_goal.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userDonations.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.mentor}
                          onChange={(e) => setEditData(prev => ({ ...prev, mentor: e.target.value }))}
                          className="text-sm w-32 px-2 py-1 border border-gray-300 rounded"
                          placeholder="Mentor name"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{user.mentor || 'Not assigned'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};