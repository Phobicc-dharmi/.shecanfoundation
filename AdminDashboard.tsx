import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Donation, Announcement } from '../types/database';
import { Users, TrendingUp, Target, Plus, Bell, Filter, Download } from 'lucide-react';
import { AdminUsersList } from './AdminUsersList';
import { Leaderboard } from './Leaderboard';
import { AnnouncementForm } from './AnnouncementForm';
import { AnnouncementsList } from './AnnouncementsList';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'leaderboard' | 'announcements'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, donationsData, announcementsData] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'intern'),
        supabase.from('donations').select('*'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false })
      ]);

      if (usersData.error) throw usersData.error;
      if (donationsData.error) throw donationsData.error;
      if (announcementsData.error) throw announcementsData.error;

      setUsers(usersData.data || []);
      setDonations(donationsData.data || []);
      setAnnouncements(announcementsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementAdded = () => {
    fetchData();
    setShowAnnouncementForm(false);
  };

  const exportReport = () => {
    const csvContent = [
      ['Name', 'Email', 'Current Amount', 'Goal', 'Progress %', 'Total Donations'].join(','),
      ...users.map(user => {
        const userDonations = donations.filter(d => d.intern_id === user.id);
        const progress = ((user.current_amount / user.fundraising_goal) * 100).toFixed(1);
        return [
          user.full_name,
          user.email,
          user.current_amount,
          user.fundraising_goal,
          `${progress}%`,
          userDonations.length
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fundraising_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalInterns = users.length;
  const totalRaised = users.reduce((sum, user) => sum + user.current_amount, 0);
  const totalGoal = users.reduce((sum, user) => sum + user.fundraising_goal, 0);
  const totalDonations = donations.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100">Manage interns and track overall progress</p>
          </div>
          <button
            onClick={exportReport}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interns</p>
              <p className="text-2xl font-bold text-gray-900">{totalInterns}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRaised.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goal</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalGoal.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((totalRaised / totalGoal) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>₹{totalRaised.toLocaleString()} raised</span>
          <span>{((totalRaised / totalGoal) * 100).toFixed(1)}% of ₹{totalGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'users', label: 'Manage Interns', icon: Users },
            { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
            { id: 'announcements', label: 'Announcements', icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <Leaderboard users={users} donations={donations} limit={5} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
              <AnnouncementsList announcements={announcements.slice(0, 3)} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <AdminUsersList users={users} donations={donations} onUpdate={fetchData} />
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <Leaderboard users={users} donations={donations} />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Manage Announcements</h3>
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Announcement</span>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <AnnouncementsList announcements={announcements} />
            </div>
          </div>
        )}
      </div>

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <AnnouncementForm
          onClose={() => setShowAnnouncementForm(false)}
          onSuccess={handleAnnouncementAdded}
        />
      )}
    </div>
  );
};