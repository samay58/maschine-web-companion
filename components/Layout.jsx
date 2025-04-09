import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Layout({ children, title = 'Maschine Web Companion' }) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Web companion app for Maschine Mikro MK3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold cursor-pointer"
              onClick={() => router.push('/')}
            >
              🎹 Maschine Web Companion
            </h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a 
                  href="#" 
                  className={`${router.pathname === '/beat-maker' ? 'text-yellow-500' : 'text-gray-300 hover:text-white'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/beat-maker');
                  }}
                >
                  Beat Maker
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Coming soon!');
                  }}
                >
                  Tutorial Mode
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 border-t border-gray-700 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>Maschine Web Companion - Not affiliated with Native Instruments</p>
          <p className="mt-2">Created for educational purposes only</p>
        </div>
      </footer>
    </div>
  );
}