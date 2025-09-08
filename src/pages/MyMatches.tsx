import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Header from '../components/Header';

const MyMatches = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Header />
      
      {/* Menu button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
          className="bg-yellow-400 hover:bg-yellow-500"
          style={{ backgroundColor: '#e7b95d' }}
        >
          <Menu className="w-6 h-6" style={{ color: '#14018d' }} />
        </Button>
      </div>

      {/* Menu overlay */}
      {showMenu && (
        <div className="absolute top-0 right-0 w-64 h-full shadow-lg z-30 p-4" style={{ backgroundColor: '#e7b95d' }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-semibold" style={{ color: '#14018d' }}>Menu</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(false)}
            >
              <X className="w-5 h-5" style={{ color: '#14018d' }} />
            </Button>
          </div>
          <div className="space-y-6">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/matches");
              }}
            >
              Mes matches
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              style={{ color: '#14018d' }}
              onClick={() => {
                setShowMenu(false);
                navigate("/profile");
              }}
            >
              Mon profil
            </Button>
          </div>
        </div>
      )}

      <div
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: "url('/fond-coeur.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-4">
          Encore un peu de patience...
        </h1>
        <p className="text-white text-lg">
          tu seras notifié par email
        </p>
      </div>
    </div>
    </>
  );
};

export default MyMatches;