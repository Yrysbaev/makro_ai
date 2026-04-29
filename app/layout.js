import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Makro AI – Project Management Mode',
  description: 'AI-powered operations assistant for wholesale food distribution with project management features.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-shell">
        <nav className="site-nav">
          <div className="nav-inner">
            <div className="nav-brand">
              <span>Makro AI</span>
              <small>Project Management Mode</small>
            </div>
            <div className="nav-links">
              <Link href="/" className="nav-link nav-link-primary">
                Dashboard
              </Link>
              <Link href="/upload" className="nav-link">
                Upload Invoice
              </Link>
              <Link href="/tasks" className="nav-link">
                Task Management
              </Link>
              <Link href="/workflow" className="nav-link">
                Workflow Board
              </Link>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
