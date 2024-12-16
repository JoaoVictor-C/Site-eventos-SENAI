import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode.react';
import propTypes from 'prop-types';
import img_cancelado from '../../../assets/Images/pedido_cancelado.png'
import constantes from "../../../componentes/Constantes.jsx";

const Ingresso = ({ obj, descricao, onUpdateDescricao }) => {
    const inDevelopment = localStorage.getItem('inDevelopment');

    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }

    function conversao(status) {
        if (obj.ativo === 1) {
            switch (status) {
                case "Pendente":
                    return "Pagamento pendente";
                case "Utilizado":
                    return "Ingresso utilizado";
                case "Validado":
                    return "Ingresso disponível";
                default:
                    return "Desconhecido";
            }
        } else {
            return "Cancelado";
        }
    }

    async function fetchNomeEvento() {
        try {
            const response = await fetch(url + `Ingresso/nome/${obj.idIngresso}`);
            const data = await response.text();
            onUpdateDescricao(obj.idIngresso, data);
        } catch (error) {
            console.error('Erro ao buscar descrição do evento:', error);
        }
    }

    useEffect(() => {
        if (!descricao) {
            fetchNomeEvento();
        }
    }, [obj.idIngresso, descricao, onUpdateDescricao]);

    return (
            <div className={`card m-3 p-3 shadow bg-white rounded border border-${obj.status === 'Pendente' ? 'warning' : obj.status === 'Cancelado' ? 'danger' : obj.status === 'Utilizado' ? 'secondary-subtle' : 'success'}`} style={{ border: '1px solid' , minWidth: '300px', maxWidth: '400px' }}>
                <p id='descricaoEvento' className='h5 text-center mb-0'>{descricao}</p>
                <hr />
                <p className='text-center mb-0'>Ingresso: <span className='fw-bold'>{obj.tipo}</span></p>
                <hr />
                {
                    (obj.status == "Cancelado")
                    ?
                    <>                                            
                        <div className='text-center mb-1' style={{ filter: obj.status === 'Pendente' ? 'blur(5px)' : 'none' }}>
                            <img src={img_cancelado}/>
                        </div>
                    </>
                    :
                    <>
                        <div className='text-center mb-1' style={{ filter: obj.status === 'Pendente' ? 'blur(5px)' : 'none' }}>
                            <QRCode value={obj.status === 'Pendente' ? 'Pendente' : obj.codigoQr} size={250} />
                        </div>
                        <p className='text-center mb-0'>                            
                            {obj.status === 'Pendente' ? 'O QR Code estará disponível após a confirmação do pagamento.' : `Código QR: ${obj.codigoQr}`}
                        </p>                    
                    </>

                }                
                
                <hr />
                <h4 className={`text-center ${obj.status === 'Pendente' ? 'text-warning' : obj.status === 'Utilizado' ? 'text-secondary' : 'text-success'} h6`}>
                    {
                        (obj.status == "Cancelado")
                        ?
                            <div className='alert alert-danger p-1 text-center' role="alert">
                                    <strong>Pedido Cancelado</strong>
                            </div>
                        :
                        <>
                            {conversao(obj.status)}
                        </>

                    }
                </h4>
            </div>
    );
};

Ingresso.propTypes = {
    obj: propTypes.object.isRequired,
    descricao: propTypes.string,
    onUpdateDescricao: propTypes.func.isRequired,
};

export default Ingresso;
