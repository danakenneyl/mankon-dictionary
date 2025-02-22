// app/layout.tsx
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
      <head />
      <body>{children}</body>
    </html>
  )
}