import React from "react";
import { Zap, Menu, X, User, MessageSquare } from 'lucide-react';
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const { isMenuOpen, setIsMenuOpen, token } = useContext(AppContext);
  console.log(token);

  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text cursor-pointer" onClick={()=>navigate('/')}>
              TradeTalents
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Community
            </a>
            <a
              href="#footer"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Support
            </a>
            
            {token ? (
              <div className="flex items-center gap-4">
                <button 
                  className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors cursor-pointer"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </button>
                <button 
                  className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors cursor-pointer" 
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            ) : (
              <button 
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors cursor-pointer" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </nav>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col gap-4">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Community
              </a>
              <a
                href="#footer"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Support
              </a>
              
              {token ? (
                <>
                  <button 
                    className="flex items-center justify-center p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors w-full cursor-pointer"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="ml-2 text-purple-600">Messages</span>
                  </button>
                  <button 
                    className="flex items-center justify-center p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors w-full cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-5 h-5 text-purple-600" />
                    <span className="ml-2 text-purple-600">Profile</span>
                  </button>
                </>
              ) : (
                <button 
                  className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors w-full cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;