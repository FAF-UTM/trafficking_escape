// Sidebar.tsx
import React from 'react';

interface SidebarProps {
  users: string[];
  selectedUser: string;
  onSelectUser: (user: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  selectedUser,
  onSelectUser,
}) => {
  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Users</h3>
      <div style={styles.userList}>
        {users.map((user) => (
          <div
            key={user}
            onClick={() => onSelectUser(user)}
            style={{
              ...styles.userItem,
              backgroundColor:
                user === selectedUser ? '#e9ecef' : 'transparent',
              color: user === selectedUser ? '#007bff' : '#343a40',
              fontWeight: user === selectedUser ? '600' : '400',
            }}
          >
            {user}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '250px',
    borderRight: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    padding: '20px',
    margin: 0,
    borderBottom: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
    color: '#343a40',
  },
  userList: {
    flex: 1,
    overflowY: 'auto',
  },
  userItem: {
    padding: '15px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
  },
};
