import { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import Modal from 'bootstrap/js/dist/modal';

export const ValidateButton = ({ id, validate, status, pedido, handleValidate}) => {


    return (
        <>
            <button
                type="button"
                className={
                    status === 'Validado' ? 'btn btn-success' : status === 'Pendente' ? 'btn btn-warning' : 'btn btn-danger'
                }
                id={id}
                onClick={()=>{handleValidate(id, pedido)}}
                disabled={status === 'Cancelado'}>
                {status === 'Validado' ? 'Validado' : status === 'Pendente' ? 'Pendente' : 'Cancelado'}
            </button>


        </>
    );
};

ValidateButton.propTypes = {
    id: propTypes.number.isRequired,
    validate: propTypes.func.isRequired,
    status: propTypes.string.isRequired,
    pedido: propTypes.object.isRequired
};
