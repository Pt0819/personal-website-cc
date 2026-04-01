export default function Footer() {
  return (
    <footer className="py-6 text-center text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
      <p>© {new Date().getFullYear()} My Portfolio. Built with React & Go.</p>
    </footer>
  );
}
