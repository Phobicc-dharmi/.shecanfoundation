import React, { useState } from 'react';
import { User, Donation } from '../types/database';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  donations: Donation[];
  limit?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, donations, limit }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const getFilteredDonations = (userId: string) => {
    const userDonations = donations.filter(d => d.intern_id === userId);
    
    if (timeFilter === 'all') return userDonations;

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'daily':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    return userDonations.filter(d => new Date(d.donation_date) >= filterDate);
  };

  const rankedUsers = users
    .map(user => {
      const filteredDonations = getFilteredDonations(user.id);
      const amount = timeFilter === 'all' 
        ? user.current_amount 
        : filteredDonations.reduce((sum, d) => sum + d.amount, 0);
      
      return {
        ...user,
        displayAmount: amount,
        donationCount: filteredDonations.length,
        progress: (user.current_amount / user.fundraising_goal) * 100,
      };
    })
    .sort((a, b) => b.displayAmount - a.displayAmount)
    .slice(0, limit);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
          <option value="daily">Today</option>
        </select>
      </div>

      <div className="space-y-3">
        {rankedUsers.map((user, index) => (
          <div
            key={user.id}
            className={`rounded-xl p-4 text-white shadow-lg ${getRankColor(index)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full">
                  {getRankIcon(index)}
                </div>
                <div>
                  <h4 className="font-semibold">{user.full_name}</h4>
                  <p className="text-sm opacity-90">
                    {user.donationCount} donations • {user.progress.toFixed(1)}% of goal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{user.displayAmount.toLocaleString()}</p>
                <p className="text-sm opacity-90">
                  {timeFilter === 'all' ? 'Total Raised' : `${timeFilter} earnings`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rankedUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No data available for the selected time period</p>
        </div>
      )}
    </div>
  );
};