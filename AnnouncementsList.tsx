import React from 'react';
import { Announcement } from '../types/database';
import { format } from 'date-fns';
import { Bell, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AnnouncementsListProps {
  announcements: Announcement[];
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ announcements }) => {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No announcements yet</p>
        <p className="text-sm">Check back later for updates!</p>
      </div>
    );
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-400',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900',
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-l-yellow-400',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900',
        };
      case 'low':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-400',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900',
        };
      default:
        return {
          icon: Bell,
          bgColor: 'bg-gray-50',
          borderColor: 'border-l-gray-400',
          iconColor: 'text-gray-500',
          titleColor: 'text-gray-900',
        };
    }
  };

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const config = getPriorityConfig(announcement.priority);
        const IconComponent = config.icon;

        return (
          <div
            key={announcement.id}
            className={`p-4 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor} hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <IconComponent className="h-5 w-5 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${config.titleColor}`}>
                    {announcement.title}
                  </h4>
                  <span className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded-full">
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {announcement.content}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(announcement.created_at), 'MMM dd, yyyy • h:mm a')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};