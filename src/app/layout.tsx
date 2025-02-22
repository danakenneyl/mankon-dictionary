// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/globals.css'
import { SearchProvider } from './context/SearchContext'
import Header from './components/header/Header';



export const metadata = {
  title: 'Mankon People\'s Dictionary',
  description: 'Your description here'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <Header data={[]} />
          {children}
        </SearchProvider>
      </body>
    </html>
  )
}