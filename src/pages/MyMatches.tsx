import React from 'react';
import Header from '../components/Header';

const MyMatches = () => {
  return (
    <>
      <Header />
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