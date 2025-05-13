import { useEffect, useState } from 'react';
import api from '../api';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications/unread/').then(res => setNotifications(res.data));
  }, []);

  return (
    <div className="relative">
      <button className="relative">
        <Bell />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
            {notifications.length}
          </span>
        )}
      </button>

      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded p-2 z-50">
          {notifications.map(n => (
            <div
              key={n.id}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/task/tasks/${n.task_id}`)}
            >
              <div className="text-sm font-semibold">{n.task_title}</div>
              <div className="text-xs text-gray-500">
                {n.sender_name} — {new Date(n.created_at).toLocaleString('uk-UA')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
