import React, { useState, useEffect } from 'react';
import './Ingresso.css';
import QRCode from 'qrcode.react'; // Importando a biblioteca para gerar QR Code

const Ingresso = ({ obj, descricao, onUpdateDescricao }) => {
    function conversao(status) {
        switch (status) {
            case "0":
                return "Pagamento Pendente";
            case "1":
                return "Pagamento Confirmado";
            case "2":
                return "Ingresso Utilizado";
            default:
                return "Pagamento Pendente";
        }
    }

    useEffect(() => {
        if (!descricao) {
            async function fetchDescricaoEvento() {
                try {
                    const url = `https://www.senailp.com.br/eventos-api/api/Ingresso/descricao/${obj.idIngresso}`
                    const response = await fetch(url);
                    const data = await response.text();
                    onUpdateDescricao(obj.idIngresso, data);
                } catch (error) {
                    console.error('Erro ao buscar descrição do evento:', error);
                }
            }

            fetchDescricaoEvento();
        }
    }, [obj.idIngresso, descricao, onUpdateDescricao]);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(obj.codigoQr)}`;
    if(obj.ativo == "1"){
        return (
            <div className='divCard'>
                <p id='descricaoEvento'>{descricao}</p>
                <hr />
                <p>Ingresso: <span>{obj.tipo}</span></p>
                <hr/>
                <div className='imagem'>
                    <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                        <QRCode value={obj.codigoQr} />
                    </a>
                </div>
                <p>Código QR: {obj.codigoQr}</p>
                
                <hr/>
                <h4 className={`status-${obj.status}`}>
                    {conversao(obj.status)}
                </h4>
            </div>
        );
    }
};

export default Ingresso;
