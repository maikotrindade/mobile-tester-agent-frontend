import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        made with ❤️ by <a href="https://github.com/maikotrindade" target="_blank" rel="noopener noreferrer">Maiko Trindade</a>
      </p>
    </footer>
  );
}
