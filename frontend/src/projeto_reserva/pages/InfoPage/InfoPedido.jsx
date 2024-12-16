import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cabecalho from '../../Components/Cabecalho/Cabecalho.jsx';
import Rodape from '../../Components/Rodape/Rodape.jsx';
import { isAuthenticated } from '../../Components/Utils/auth.jsx';
import pix from '../../../assets/Images/pix.png';
import qr from '../../../assets/Images/qrcode.jfif'

export const InfoPedido = () => {
    const navigate = useNavigate();

    const pedido = localStorage.getItem('pedido') ? JSON.parse(localStorage.getItem('pedido')) : null;
    const ingressos = localStorage.getItem('ingressos') ? JSON.parse(localStorage.getItem('ingressos')) : [];

    const verificarAutenticacao = () => {
        if (!isAuthenticated()) {
            console.log('Usuário não autenticado');
            navigate('/Login');
        }
    };

    useEffect(() => {
        verificarAutenticacao();
    }, []);

    return (
        <>
            <Cabecalho />
            <div className="container mt-5">
                <h1 className="mb-4 text-start container fs-2">Informações do Pedido</h1>
                {/* <div className='d-flex flex-row justify-content-between flex-wrap align-items-center'>
                        <div className="d-flex justify-content-start flex-column" style={{maxWidth: '600px'}}>
                            <p style={{ backgroundColor: '#eded82', borderRadius: '5px', padding: '10px', marginLeft: '8px' }}>
                                <strong>Em caso de:</strong> Pagamento em dinheiro dirija-se à instituição Senai Lençóis Paulista e obtenha mais informações na secretaria.
                            </p>
                            <p style={{ backgroundColor: '#eded82', borderRadius: '5px', padding: '10px', marginLeft: '8px' }}>
                                <strong>Em caso de:</strong> Pagamento via PIX, confirme a transação enviando o comprovante.
                            </p>
                            <div className='my-3' style={{margin: '0 auto'}}>
                                <a className='btn btn-info btn-lg text-white text-decoration-none px-4' href="https://wa.me/+55149970558355" target="_blank" rel="noreferrer">
                                    <div className='d-flex align-items-center justify-content-center fs-5' style={{ fontSize: '1.3rem', gap: '10px', fontWeight: 'bold' }}>
                                    Mande comprovante aqui
                                        <img src={pix} alt="Pix" style={{ width: '30px' }} />
                                    </div>
                                </a>
                            </div>
                        </div>
                    <div className="d-flex justify-content-center align-items-center flex-column" style={{margin: '0 auto'}}>
                        <h3 className='text-center' style={{ width: '80px', height: '30px', justifyItems: 'center' }}><strong>PIX</strong></h3>
                        <img style={{ width: '200px', height: '200px' }} src={qr} />
                    </div>
                </div> */}
                <div className="col-12 mt-4">
                            <div class="card">
                                <h5 class="card-header text-bg-success mb-3">Reserva Realizada com Sucesso</h5>
                                <div class="card-body">
                                   
                                    <h5 class="card-title">Como confirmo?</h5>
                                    <p class="card-text"><li><strong>Presencial:</strong> Vá até o SENAI e pague com um dos atendentes (secretaria, biblioteca ou atendentes da turma de administração)</li></p>
                                    <p class="card-text"><li><strong>Forma de pagamento:</strong> Dinheiro ou PIX</li></p>

                                    {/* <p class="card-text"><li><strong>PIX:</strong> Faça o pix para a chave: festajuninasenai2024@gmail.com e envie o comprovante via whatsapp para o número: (14) 99705-8355</li></p>
                                    <div className='text-center'>
                                        <a className='btn btn-info btn-lg text-white text-decoration-none px-4 mb-2 text-center'
                                        href="https://wa.me/+55149970558355" target="_blank" rel="noreferrer">
                                            <div className='d-flex align-items-center justify-content-center'
                                                style={{fontSize: '1.3rem', gap: '10px', fontWeight: 'bold'}}>
                                                Enviar Comprovante PIX
                                                <img className='img-fluid' src={pix} alt='WhatsApp Logo'
                                                    style={{height: '30px'}}/>
                                            </div>
                                        </a>

                                        <h5 className='card-title text-bg-warning mb-3 p-2'>ATENÇÃO: Somente após a comprovação do pagamento que seu ingresso será liberado!</h5>

                                    </div>  */}

                                </div>
                            </div>
                           
                        </div>

                <hr />
                {pedido ? (
                    <>
                        <div className='container'>
                            <h1 className="mb-4 fs-2 text-start">Minha Reserva</h1>
                            <div className="d-flex justify-content-between flex-column mb-3">
                                <h5>Quantidade de Ingressos: {pedido.quantidade}</h5>
                                <h5>Total: R$ {pedido.total}</h5>
                            </div>
                            <div className=" row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                                {ingressos.map((ingresso, index) => {
                                    if (ingresso.quantidade === 0) {
                                        return null;
                                    }
                                    return (
                                        <div className="col" key={index}>
                                            <div className="card h-100 shadow-sm" style={{ borderRadius: '15px' }}>
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">{ingresso.tipo}</h5>
                                                    <h6 className="card-subtitle mb-2 text-muted">Valor total: R$ {ingresso.valor * ingresso.quantidade}</h6>
                                                    <h6 className="card-subtitle mb-2 text-muted">Valor: R$ {ingresso.valor}</h6>
                                                    <h6 className="card-subtitle mb-2 text-muted">Quantidade: {ingresso.quantidade}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <h1 className="text-center mt-5">Nenhum pedido encontrado</h1>
                )}
            </div>
            <Rodape />
        </>
    );
}

export default InfoPedido;