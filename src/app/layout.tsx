// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/globals.css'
import { SearchProvider } from '../utils/SearchContext'
import Header from './header/Header';
import dictionary from '@/data/dictionary.json';

export const metadata = {
  title: 'Mankon Dictionary',
  description: 'Searchable dictionary for the Mankon language, a Western Grassfields Bantu language.',
  verification: {
    google: '4Hx86Sk3InB7XpuulN8vdTt60jZa3fqW2m9IP1CIJNM',
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