import './globals.css';

export const metadata = {
  title: 'Makro AI Assistant – Business Automation System',
  description: 'Role-based AI assistant dashboard for marketing, sales, support, and analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
