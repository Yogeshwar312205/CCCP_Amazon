import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../features/notification/notificationSlice';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { notifications, unreadCount, loading } = useSelector((state) => state.notification);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Poll for unread count
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 45000); // Poll every 45 seconds

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [isOpen, isAuthenticated, dispatch]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      dispatch(markNotificationRead(item.id));
    }
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    dispatch(markAllNotificationsRead());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PRICE_DROP':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-200 hover:text-amazon-yellow focus:outline-none transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 text-gray-800 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[11px] text-gray-400">Updates on your orders will show up here</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition cursor-pointer hover:bg-gray-50 flex gap-3 ${
                    !item.isRead ? 'bg-amber-50/40' : 'bg-white'
                  }`}
                >
                  {/* Indicator Dot */}
                  <div className="pt-1 flex-shrink-0">
                    {!item.isRead ? (
                      <span className="block w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getTypeColor(item.type)}`}>
                        {item.type ? item.type.replace('_', ' ') : 'ALERT'}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className={`text-xs ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>

                    {item.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold mt-1">
                        View details <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
