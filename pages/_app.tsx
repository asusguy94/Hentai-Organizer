import Head from 'next/head'
import Script from 'next/script'
import type { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'

import { Container, CssBaseline } from '@mui/material'

import NavBar from '@components/navbar'

import '@styles/globals.scss'
import 'plyr/dist/plyr.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  subsets: ['latin']
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Hentai</title>
      </Head>

      <Script async src='https://pro.fontawesome.com/releases/v5.15.4/js/all.js' />
      <Script async src='https://pro.fontawesome.com/releases/v5.15.4/js/fontawesome.js' />

      <CssBaseline />

      <NavBar />
      <Container component='main' maxWidth={false} className={roboto.className}>
        <Component {...pageProps} />
      </Container>
    </>
  )
}
