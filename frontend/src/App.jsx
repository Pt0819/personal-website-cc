import { useState } from 'react';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'skills':
        return <Skills />;
      case 'contact':
        return <Contact />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>{renderContent()}</main>
      <Footer />
    </div>
  );
}

export default App;
