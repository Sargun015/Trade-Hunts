import React from 'react';
import { ArrowRight, Users, Star, Shield, MapPin, Repeat, Zap, Globe, Menu, X} from 'lucide-react';
import { useContext } from 'react'; 
import { AppContext } from '../context/AppContext';
import {useNavigate} from "react-router-dom"





const LandingPage = () => {

  const navigate  = useNavigate();

  const features = [
    {
      icon: <Repeat className="w-8 h-8 text-purple-500" />,
      title: "Skill-Based Trading",
      description: "Exchange your expertise for services you need, no money required",
      color: "bg-purple-50"
    },
    {
      icon: <Users className="w-8 h-8 text-pink-500" />,
      title: "Verified Professionals",
      description: "Connect with skilled experts in various domains",
      color: "bg-pink-50"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Credit System",
      description: "Earn credits through great service to unlock more opportunities",
      color: "bg-yellow-50"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Secure Agreements",
      description: "Protected exchanges with milestone tracking",
      color: "bg-green-50"
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: "Local Matching",
      description: "Find skilled professionals in your area",
      color: "bg-blue-50"
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-500" />,
      title: "Global Community",
      description: "Connect with professionals worldwide",
      color: "bg-indigo-50"
    }
  ];



    const {isMenuOpen,setIsMenuOpen} = useContext(AppContext);
  

  return (
    <div className="relative w-full">
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="w-full pt-40 pb-32">
          <div className="text-center">
            <div className="inline-block animate-bounce mb-6">
              <Zap className="w-16 h-16 text-yellow-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
              Trade Skills, Not Money
            </h1>
            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto px-4">
              Join the revolutionary marketplace where your expertise becomes your currency
            </p>
            <div className="flex gap-6 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg cursor-pointer" onClick={()=>navigate('/browse')}>
                Get Started <ArrowRight className="w-6 h-6" />
              </button>
              <button className="bg-white text-gray-800 px-12 py-4 rounded-full text-xl font-semibold border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105 shadow-lg cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="w-full py-32" id="features">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`${feature.color} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <div className="mb-6 transform hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full py-32 bg-white bg-opacity-50" id="how-it-works">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 px-4">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-3xl">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Create Your Profile</h3>
              <p className="text-gray-600 text-lg">List your skills and showcase your expertise level</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-3xl">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Find Matches</h3>
              <p className="text-gray-600 text-lg">Connect with professionals who need your skills</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-red-500 to-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-3xl">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Exchange Services</h3>
              <p className="text-gray-600 text-lg">Trade skills and earn credits</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-32">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Trading Skills?
            </h2>
            <p className="mb-12 text-white text-xl max-w-3xl mx-auto px-4">
              Join thousands of professionals who are already exchanging skills and growing their network.
            </p>
            <button className="bg-white text-gray-800 px-12 py-4 rounded-full text-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg">
              Join Now - It's Free!
            </button>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default LandingPage;