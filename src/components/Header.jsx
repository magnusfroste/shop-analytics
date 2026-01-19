import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/anavid.png" alt="Anavid Logo" className="h-8 w-auto" />
        </Link>
      
        <Button variant="outline" asChild>
          <a href="https://www.anavid.ai" target="_blank" rel="noopener noreferrer">Visit Anavid.ai</a>
        </Button>
      </div>
    </header>
  );
};

export default Header;