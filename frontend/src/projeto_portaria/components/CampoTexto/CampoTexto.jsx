import React from 'react';
import './CampoTexto.css';

const CampoTexto = ({ label, place, tipo, nome, valor, aoAlterar }) => {
    return (
        <div className='campo-texto'>
            <label>{label}</label>
            <input id='input'
                type={tipo} 
                placeholder={place} 
                name={nome} 
                value={valor} 
                onChange={e => aoAlterar(e.target.value)} 
                className='campo-input' 
            />
        </div>
    );
}

export default CampoTexto;