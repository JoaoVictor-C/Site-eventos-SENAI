import React from 'react';
import { TEXT_FOOTER_MESSAGE } from '../../constants/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-senai-gray text-white text-center p-6 shadow-inner mt-auto dark:bg-gray-800 dark:text-gray-300">
      <p>{TEXT_FOOTER_MESSAGE}</p>
    </footer>
  );
};

export default Footer;