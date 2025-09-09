import './styles/hc.css';
import './styles/sidebar.css';
import Sidebar from '@/app/components/Sidebar';
import AppHeader from '@/app/components/AppHeader';

export const metadata = {
  title: 'CRM MVP',
  description: 'Minimal CRM with Next.js + Prisma',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' data-theme='hc-dark'>
      <body>
        <div className='appShell'>
          <Sidebar />
          <div className='appMain'>
            <AppHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
