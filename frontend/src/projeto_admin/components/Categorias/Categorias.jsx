import React from 'react';
import Botaoing from '../Buttons/Botaoing.jsx'; // Importe o componente Botaoing
const Categorias = ({ onButtonClick }) => {
    return(
        <>
            <Botaoing onButtonClick={onButtonClick} /> {/* Passe a função de clique do botão para o componente Botaoing */}
        </>
    );
}

export default Categorias;
