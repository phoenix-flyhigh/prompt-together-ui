import Layout from "@/components/Layout";
import { CollabProvider } from "@/hooks/useCollabContext";
import { ThemeProvider } from "@/hooks/useTheme";
import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Prompt Together - Collaborative Sessions</title>
        <meta
          name="description"
          content="Create and join collaborative prompt sessions with real-time sharing and editing capabilities."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="prompt engineering, collaboration, real-time, sessions, ai prompts"
        />
        <meta
          property="og:title"
          content="Prompt Together - Collaborative Sessions"
        />
        <meta
          property="og:description"
          content="Create and join collaborative prompt sessions with real-time sharing and editing capabilities."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider>
        <CollabProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CollabProvider>
      </ThemeProvider>
    </>
  );
}
