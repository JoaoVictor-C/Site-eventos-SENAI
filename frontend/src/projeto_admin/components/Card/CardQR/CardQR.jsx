import './CardQR.css'
import qrcodeimg from '../../../assets/Images/qrcode.png'
import React from 'react';

const QRCard = () => {
    return (
        <div className='card_qrcode'>
            <div className='card_imagem'>
                <img src={qrcodeimg} alt='qrcode.png' />
            </div>
                <div className='card_texto'>
                    <p>sem ingressos</p>
                </div>
        </div>
    )
}

export default QRCard;