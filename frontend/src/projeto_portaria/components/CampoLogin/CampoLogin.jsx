import React from 'react';

const CampoLogin = ({ label, place, tipo, nome, valor, aoAlterar }) => {
        return (
            <div className="form-group text-center">
              <label htmlFor={name}>{label}</label>
              <input
                type={tipo}
                className="form-control text-center"
                id={nome}
                name={nome}
                placeholder={place}
                value={valor}
                onChange={aoAlterar}
              />
            </div>
          );
        };
        
        export default CampoLogin;