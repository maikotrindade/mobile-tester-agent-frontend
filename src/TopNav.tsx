import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './TopNav.module.css';

const TopNav: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <NavLink to="/" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Home
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Settings
        </NavLink>
      </div>
    </nav>
  );
};

export default TopNav;
