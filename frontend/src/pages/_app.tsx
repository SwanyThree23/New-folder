import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Swannie3 | Production Live Platform</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Industry Leading Quality Social Live Streaming Platform" />
            </Head>
            <main className="min-h-screen bg-background font-sans antialiased">
                <Component {...pageProps} />
            </main>
        </>
    )
}
