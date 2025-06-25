import React from 'react';
import { Link } from 'react-router-dom';
import { TEXT_PAGE_NOT_FOUND, TEXT_BACK_TO_HOME } from '../../../constants/constants';
import { ROUTES } from '@/config/routes';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <img src="https://picsum.photos/seed/404page/300/200" alt="Página não encontrada" className="rounded-lg shadow-lg mb-8 w-full max-w-sm h-auto"/>
      <h1 className="text-5xl font-bold text-senai-red mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-senai-gray dark:text-gray-100 mb-6">{TEXT_PAGE_NOT_FOUND}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        A página que você está tentando acessar não existe ou foi movida. 
        Verifique o endereço digitado ou retorne à página inicial.
      </p>
      <Link
        to={ROUTES.HOME}
        className="bg-senai-red text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-md"
      >
        {TEXT_BACK_TO_HOME}
      </Link>
    </div>
  );
};

export default NotFoundPage;