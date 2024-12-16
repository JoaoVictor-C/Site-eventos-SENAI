import React from 'react';
import './Botaoing.css';

const Botaoing = ({ onButtonClick }) => {
    return(
        <>
            <h4 style={{textAlign: 'center', marginTop: '20px', color: '#3a3a3a', marginBottom: '20px'}}>Selecionar Gráfico por: </h4>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                {/* Chame a função onButtonClick com o tipo de gráfico correto ao clicar em um botão */}
                <button onClick={() => onButtonClick('lote')} className='button' style={{marginRight: '40px'}}>Lote</button>
                <button onClick={() => onButtonClick('ingresso')} className='button'>Ingresso</button>
            </div>
        </>
    );
}

export default Botaoing;
