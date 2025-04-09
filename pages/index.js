import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <Head>
        <title>Maschine Web Companion</title>
        <meta name="description" content="Web companion app for Maschine Mikro MK3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full max-w-2xl flex-1 text-center animate-fadeIn">
        <h1 className="text-5xl font-medium mb-8 text-white">
          🎹 Maschine Web Companion
        </h1>
        <p className="text-xl mb-10 text-gray-300">
          A web-based companion app for Native Instruments Maschine Mikro MK3
        </p>
        
        <div className="flex flex-col space-y-5 w-64">
          <button
            onClick={() => router.push('/beat-maker')}
            className="btn btn-primary text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-150"
          >
            Start Beat Making
          </button>
          
          <button className="btn text-lg px-8 py-4 rounded-xl shadow-md transform hover:scale-[1.02] transition-transform duration-150">
            Check MIDI Connection
          </button>
        </div>
        
        <div className="mt-16 px-6 py-4 bg-surface rounded-lg border border-zinc-800 shadow-md text-sm text-gray-400">
          <p>Please connect your Maschine Mikro MK3 before proceeding.</p>
        </div>
      </main>
    </div>
  );
}