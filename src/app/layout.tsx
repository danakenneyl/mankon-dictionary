// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/globals.css'
import { SearchProvider } from '../context/SearchContext'
import Header from '../components/header/Header';
import dictionary from '@/data/dictionary.json';
import { BaseEntry } from "@/types/Datatypes";


export const metadata = {
  title: 'Mankon People\'s Dictionary',
  description: 'Your description here'
}

export default function RootLayout({children }: {children: React.ReactNode}) {
  const dictionaryData: BaseEntry[] = dictionary as BaseEntry[];
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <Header data = {dictionaryData} />
          {children}
        </SearchProvider>
      </body>
    </html>
  )
}