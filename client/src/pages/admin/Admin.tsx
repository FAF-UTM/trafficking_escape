import React from 'react';
import styles from './admin.module.css';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.admin}>
      <h2>Admin Panel</h2>
      <div className={styles.admin_btns}>
        <div
          className={styles.admin_btn}
          onClick={() => navigate('/admin/sessions')}
        >
          Sesions
        </div>
        <div
          className={styles.admin_btn}
          onClick={() => navigate('/admin/languages')}
        >
          Languages
        </div>
      </div>
    </div>
  );
};

export default Admin;
