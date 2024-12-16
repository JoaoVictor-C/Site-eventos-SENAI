// NotFoundPage.jsx
import React from 'react';
import Cabecalho from '../projeto_reserva/Components/Cabecalho/Cabecalho';
import Rodape from '../projeto_reserva/Components/Rodape/Rodape';

const NotFoundPage = () => {
    return (
        <>
            <Cabecalho />
            <div className='container'>
                <h1>404 - Página Não Encontrada</h1>
                <p>A página que você está procurando não existe.</p>
            </div>
            <Rodape />
        </>
    );
};

export default NotFoundPage;
