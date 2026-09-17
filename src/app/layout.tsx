import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSGT Content - Trợ lý tuyên truyền TTATGT đường bộ',
  description: 'Hệ thống quản lý, biên tập, kiểm duyệt và theo dõi chỉ tiêu tin bài tuyên truyền cho lực lượng CSGT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
