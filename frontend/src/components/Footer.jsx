import React from 'react'
import { Zap, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react'


const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-32" id="footer">
    <div className="w-full px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold">TradeTalents</span>
          </div>
          <p className="text-gray-400">
            Exchange skills, grow together. Join the future of professional collaboration.
          </p>
          <div className="flex gap-4">
            <Facebook className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
            <Twitter className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
            <Instagram className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
            <Linkedin className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
            <Github className="w-6 h-6 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">How It Works</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Success Stories</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Community Guidelines</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Trust & Safety</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Cookie Policy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Accessibility</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; 2025 SkillSwap. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer