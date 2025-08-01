import React from 'react';
import { Donation } from '../types/database';
import { format } from 'date-fns';
import { User, DollarSign, CreditCard, Calendar } from 'lucide-react';

interface DonationsListProps {
  donations: Donation[];
}

export const DonationsList: React.FC<DonationsListProps> = ({ donations }) => {
  if (donations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No donations recorded yet</p>
        <p className="text-sm">Add your first donation to get started!</p>
      </div>
    );
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      case 'cheque': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{donation.donor_name}</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(donation.donation_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">₹{donation.amount.toLocaleString()}</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPaymentMethodColor(donation.payment_method)}`}>
                {donation.payment_method}
              </span>
            </div>
          </div>
          {donation.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{donation.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
};