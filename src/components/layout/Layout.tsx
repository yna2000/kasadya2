
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from '../chatbot/ChatBot';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow animate-fade-in">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Layout;
