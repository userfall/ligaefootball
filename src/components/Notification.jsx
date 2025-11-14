import { useNotifications } from "../context/NotificationContext";

export default function Notification() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="notifications">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type}`}>
          <p>{n.title}</p>
          <small>{n.message}</small>
          {!n.read && <button onClick={() => markAsRead(n.id)}>Mark read</button>}
        </div>
      ))}
    </div>
  );
}
