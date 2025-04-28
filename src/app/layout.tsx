// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/globals.css'
import { SearchProvider } from '../utils/SearchContext'
import Header from './header/Header';
import dictionary from '@/data/dictionary.json';

export const metadata = {
  title: 'Mankon Dictionary',
  description: 'The Mankon Dictionary is a searchable, talking Mankon-English dictionary that documents a Western Grassfields Bantu language.',
  verification: {
    google: '4Hx86Sk3InB7XpuulN8vdTt60jZa3fqW2m9IP1CIJNM',
  },
  icons: {
    icon: '/images/logo.svg', 
  },
};

export default function RootLayout({children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>

      <div className="left-stripe"></div>
      <div className="right-stripe"></div>
        <SearchProvider>
          <Header data = {dictionary} />
          {children}
        </SearchProvider>
      </body>
    </html>
  )
}