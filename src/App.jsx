import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  const [view, setView] = useState('home');

  // Simple hash-based routing to support browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login') {
        setView('login');
        window.scrollTo(0, 0);
      } else {
        setView('home');
      }
    };

    // Check hash on load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView) => {
    if (newView === 'login') {
      window.location.hash = '#/login';
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-blue-100 selection:text-blue-900">
      {view === 'login' ? (
        <Login onNavigate={navigateTo} />
      ) : (
        <>
          <Navbar onNavigate={navigateTo} currentView={view} />
          <main className="flex-grow">
            <Home onNavigate={navigateTo} />
          </main>
          <Footer onNavigate={navigateTo} />
        </>
      )}
    </div>
  );
}

export default App;
