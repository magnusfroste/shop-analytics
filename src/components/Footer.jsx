import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© 2024 Anavid. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="https://www.anavid.ai/about-us" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">About Us</a>
            <a href="https://www.anavid.ai/contactus" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Contact</a>
            <a href="https://www.anavid.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;