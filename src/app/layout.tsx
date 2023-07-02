import ClientLayout from './client-layout'

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <title>Hentai</title>
      </head>

      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export default RootLayout
