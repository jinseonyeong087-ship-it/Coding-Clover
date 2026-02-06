import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', { withCredentials: true });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count', { withCredentials: true });
      setUnreadCount(response.data);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Polling for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await axios.put(`/api/notifications/${notification.id}/read`, {}, { withCredentials: true });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }
      if (notification.linkUrl) {
        navigate(notification.linkUrl);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation(); // prevent triggering click event on the item
    try {
      await axios.delete(`/api/notifications/${notificationId}`, { withCredentials: true });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // If deleting an unread notification, decrement count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm">알림</h4>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              새로운 알림이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 cursor-pointer transition-colors group ${!notification.read
                    ? 'bg-white border-l-4 border-blue-500 shadow-sm'
                    : 'bg-gray-100/80 text-gray-500'
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex flex-col gap-1 pr-4">
                    {/* pr-4 added to prevent text overlap with delete button */}
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-medium ${!notification.read ? 'text-blue-600' : 'text-gray-500'}`}>
                        {formatType(notification.type)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, notification.id)}
                  >
                    <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

// Helper function to format notification types
const formatType = (type) => {
  const typeMap = {
    'NEW_LECTURE_UPLOADED': '새 강의',
    'NEW_QNA_QUESTION': '새 질문',
    'QNA_ANSWERED': '답변 완료',
    'REFUND_REQUEST': '환불 요청',
    'REFUND_APPROVED': '환불 완료',
    'REFUND_REJECTED': '환불 거절',
    'INSTRUCTOR_APPLICATION': '강사 신청',
    'INSTRUCTOR_APPROVED': '강사 승인',
    'INSTRUCTOR_REJECTED': '강사 반려',
    'NEW_LECTURE_REQUEST': '강의 승인 요청',
    'LECTURE_APPROVED': '강의 승인',
    'LECTURE_REJECTED': '강의 반려',
    'NEW_COURSE_REQUEST': '강좌 승인 요청',
    'COURSE_APPROVED': '강좌 승인',
    'COURSE_REJECTED': '강좌 반려',
    'COURSE_RESUBMITTED': '강좌 재요청',
    'LECTURE_RESUBMITTED': '강의 재요청'
  };
  return typeMap[type] || '알림';
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}분 전`;
  }
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}시간 전`;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default NotificationDropdown;
