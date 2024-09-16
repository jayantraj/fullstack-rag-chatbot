import React from 'react';
import { useAuth } from '../../contexts/authContext';
import Chatbot from '../chatbot/Chatbot_websocket';
import Typewriter from '../typewriter/Typewriter';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-page">
      <div className="text-2xl font-italic pt-14 text-center" style={{ fontFamily: 'Helvetica' }}>
        <Typewriter text={`Hi, ${currentUser.displayName ? currentUser.displayName : currentUser.email}! I'm here to decode life's mysteries... or just answer your PDF questions!`} />
      </div>
      <div className="chatbot-container mt-6">
        <Chatbot />
      </div>
    </div>
  );
};

export default Home;





