import { useState } from 'react';
import Cabecalho from '../../Components/Cabecalho/Cabecalho.jsx';
import Rodape from '../../Components/Rodape/Rodape.jsx';
import imgBanner from '../../../assets/Images/logo_zap.png';
import imgSuport from '../../../assets/Images/suporte_img.png';
import 'bootstrap'
const SuportePage = () => {
    const [itemFrase, setItemFrase] = useState('');

    const frases = [
        `Somos uma equipe de alunos de Desenvolvimento de Sistemas apaixonados por criar soluções inovadoras. 
         Desenvolvemos um site de eventos para tornar a experiência de organizadores e participantes ainda mais fácil e divertida. 
         Estamos aqui para ajudar e garantir que sua experiência seja a melhor possível.`,

        `Em nosso site, aceitamos apenas pagamentos via Pix ou dinheiro. 
         Essas são as opções disponíveis para garantir uma experiência de pagamento simples e segura. 
         Se precisar de assistência ou tiver alguma dúvida sobre isso, estamos aqui para ajudar.`,

        `Reservar seu ingresso garante sua participação no evento e evita contratempos de última hora, como ingressos esgotados. 
         Além disso, ao fazer a reserva antecipadamente, você pode aproveitar eventuais benefícios extras, como descontos especiais. 
         Não deixe para depois, garanta agora mesmo o seu lugar e prepare-se para uma experiência incrível no evento!`,

        `Após reservar seu ingresso, por favor, procure um aluno da administração presente na Escola Senai Lençóis Paulista para validar sua reserva.
         Eles estarão prontos para ajudá-lo e garantir que sua participação seja registrada corretamente.
         Estamos ansiosos para recebê-lo e tornar sua experiência no evento ainda mais especial!`,
    ];

    const openModal = (index) => {
        setItemFrase(frases[index]);
        let myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
            keyboard: false
        });
        myModal.show();
    }



    return (
        <div>
            <Cabecalho />
            <div className='container'>
                <div className='row'>
                    <div className='col-lg-6 mt-5'>
                        <div className='bg-primary text-center text-white py-3 rounded mb-4'>
                            <h2>DUVIDAS FREQUENTES</h2>
                        </div>
                        <div className='list-group'>
                            <button className='list-group-item list-group-item-action' onClick={() => openModal(0)}>
                                <h1 className='h5'>Quem somos nós?</h1>
                            </button>
                            <button className='list-group-item list-group-item-action' onClick={() => openModal(1)}>
                                <h1 className='h5'>Quais as formas de pagamento aceitas?</h1>
                            </button>
                            <button className='list-group-item list-group-item-action' onClick={() => openModal(2)}>
                                <h1 className='h5'>Por que reservar seu ingresso?</h1>
                            </button>
                            <button className='list-group-item list-group-item-action' onClick={() => openModal(3)}>
                                <h1 className='h5'>Com quem falar após a reserva do ingresso?</h1>
                            </button>
                        </div>
                    </div>
                    <div className='col-lg-6 text-center'>
                        <img className='img-fluid' src={imgSuport} alt='Suporte' />
                        <a className='btn bg-primary text-white text-decoration-none px-4 mb-5'
                            href="https://wa.me/+5514997058355" target="_blank" rel="noreferrer">
                            <div className='d-flex align-items-center justify-content-center' style={{ fontSize: '1.5rem', gap: '10px', fontWeight: 'bold' }}>
                                FALE CONOSCO
                                <img className='img-fluid' src={imgBanner} alt='WhatsApp Logo' style={{ height: '30px' }} />
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-2" id="exampleModalLabel">FAQ - Perguntas Frequentes</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p className="fs-5">
                                    {itemFrase}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary fs-5" data-bs-dismiss="modal">Fechar</button>
                            </div>
                        </div>
                    </div>
                </div>

            <Rodape />
        </div>
    );
}

export default SuportePage;
