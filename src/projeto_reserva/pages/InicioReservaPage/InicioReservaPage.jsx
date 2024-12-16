import './InicioReservaPage.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../Components/Utils/auth.jsx';
import { ToastContainer } from 'react-toastify';
import Cabecalho from '../../Components/Cabecalho/Cabecalho';
import Rodape from '../../Components/Rodape/Rodape';
import cardImage from '../../../assets/Images/card2certo.png';
import agendaIcon from '../../../assets/Images/agenda.png';
import localIcon from '../../../assets/Images/local.png';
import imgBanner from '../../../assets/Images/img_banner.jpg';
import { toast } from 'react-toastify';
import pix from '../../../assets/Images/pix.png'

import 'react-toastify/dist/ReactToastify.css';
import constantes from "../../../componentes/Constantes.jsx";

const ConfirmationModal = ({ show, handleClose, handleConfirm, handleCancel, pedido, ingressos }) => {
    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} id="confirmationModal" tabIndex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirmationModalLabel">Confirmação de reserva</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Deseja confirmar a reserva dos ingressos?</p>
                        <p>{<div className='' style={{ backgroundColor: '#eded82', borderRadius: '5px', padding: '15px', width: '100%' }} >
                            <p><strong>Atenção:</strong> Você tem 24 horas para realizar o pagamento. Enquanto o pagamento não for efetuado, não será possivel realizar outras reservas.</p>
                        </div>
                        }</p>

                        {/* Mostra as informações do pedido em forma de card */}
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Pedido</h5>
                                <p className="card-text">Quantidade: {pedido.quantidade}</p>
                                <p className="card-text">Total: {Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(pedido.total)}</p>

                                <h5 className="card-title">Ingressos selecionados</h5>
                                <div className="d-flex flex-column gap-3">

                                    {ingressos.map((ingresso, index) => {
                                        if (ingresso.quantidade > 0) {
                                            return (
                                                <div key={index} className="card">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{ingresso.tipo}</h5>
                                                        <p className="card-text">Valor: {Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(ingresso.tipo === 'Infantil' ? 5 : ingresso.valor)}</p>
                                                        <p className="card-text">Quantidade: {ingresso.quantidade}</p>

                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                        <button type="button" className="btn btn-primary" onClick={handleConfirm}>Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const InicioReservaPage = () => {
    const { eventoId } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const inDevelopment = localStorage.getItem('inDevelopment');
    const [evento, setEvento] = useState({});
    const [lotes, setLotes] = useState([{}]);
    const [loteAtual, setLoteAtual] = useState({});
    const [valoresIngressosSelecionados, setValoresIngressosSelecionados] = useState([]);
    var url = ''
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [reservationConfirmed, setReservationConfirmed] = useState(false);

    const [tipoIngresso, setTipoIngresso] = useState([
        {
            nome: 'Infantil',
            desconto: 0.5,
            idEvento: eventoId,
        },
        {
            nome: 'Colaborador',
            desconto: 1,
            idEvento: eventoId,
        },
        {
            nome: 'Aluno',
            desconto: 1,
            idEvento: eventoId,
        },
        {
            nome: 'Comunidade',
            desconto: 1,
            idEvento: eventoId,
        }
    ]);

    const handleOpenConfirmationModal = () => {
        if (valoresIngressosSelecionados.reduce((a, b) => a + b, 0) === 0) {
            toast.error('Selecione pelo menos um ingresso para reservar.');
            return;
        }
        setShowConfirmationModal(true);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
    };

    const handleConfirmReservation = async () => {
        try {
            const idUsuario = localStorage.getItem('id');

            const getLastPedidoStatus = async (idUsuario) => {
                const response = await fetch(`${url}Pedido/Usuario/${idUsuario}`);
                if (!response.ok) {
                    throw new Error("Erro ao buscar os pedidos do usuário");
                }
                const data = await response.json();

                if (data.length === 0) {
                    return null;
                }
                return data[data.length - 1].status;
            };

            const pedidoStatus = await getLastPedidoStatus(idUsuario);

            if (pedidoStatus === 'Pendente') {
                setErrorMessage("O pedido anterior não está validado!");
                return;
            }

            await handleSubmit();
            setReservationConfirmed(true);
            handleCloseConfirmationModal();
        } catch (error) {
            setErrorMessage("Erro ao confirmar reserva!");
        }
    };

    const handleCancelReservation = () => {
        handleCloseConfirmationModal();
    };

    const verificarAutenticacao = () => {
        if (!isAuthenticated()) {
            console.log('Usuário não autenticado');
            navigate('/Login');
        }
    };

    const getImagem = async (idEvento) => {
        try {
            const response = await fetch(url + `Evento/${idEvento}/image`);
            const data = await response.blob();
            return URL.createObjectURL(data);
        } catch (error) {
            console.error('Erro ao buscar imagem do evento:', error);
        }
    };

    const fetchDataEvento = async () => {
        const response = await fetch(`${url}Evento/${eventoId}`);
        const data = await response.json();
        data.imagem = await getImagem(data.idEvento);
        setEvento(data);
    };

    const fetchDataLotes = async () => {
        const response = await fetch(url + `Lote/evento/${eventoId}`)
        const data = await response.json()
        setLotes(data)
        data.map((lote, index) => {
            if (lote.ativo === 1) {
                setLoteAtual(lote)
                let valores = []
                tipoIngresso.map((tipo, index) => {
                    valores.push(0)
                })
                setValoresIngressosSelecionados(valores)
                return null;
            }
        })
    }

    useEffect(() => {
        verificarAutenticacao();
        fetchDataEvento();
        fetchDataLotes();
    }, []);

    const getSum = () => {
        let total = 0;
        valoresIngressosSelecionados.forEach((valor, index) => {
            // Se o tipo == 'Infantil', o valor é 5
            if (tipoIngresso[index].nome === 'Infantil') {
                total += valor * 5;
            } else {
                total += valor * loteAtual.valorUnitario * tipoIngresso[index].desconto;
            }
        });
        return total;
    }

    const handleSubmit = async () => {
        if (!localStorage.getItem('id')) {
            navigate('/Login');
            return;
        }

        const dataAtual = new Date().toISOString();
        console.log(dataAtual)

        const pedidoData = {
            idPedido: 0,
            usuariosId: localStorage.getItem('id'),
            dataCadastro: dataAtual,
            total: getSum(),
            quantidade: valoresIngressosSelecionados.reduce((a, b) => a + b, 0),
            formaPagamento: 'Presencial',
            status: 'Pendente',
            validacaoIdUsuario: 0
        };

        try {
            const response = await fetch(`${url}Pedido`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedidoData)
            });
            const data = await response.json();

            const ingressos = [];
            valoresIngressosSelecionados.forEach((valor, index) => {
                for (let i = 0; i < valor; i++) {
                    ingressos.push({
                        idIngresso: 0,
                        pedidosId: data.idPedido,
                        pedidosUsuariosId: parseInt(localStorage.getItem('id')),
                        loteId: loteAtual.idLote,
                        status: 'Pendente',
                        tipo: tipoIngresso[index].nome,
                        valor: tipoIngresso[index].nome === 'Infantil' ? 5 : loteAtual.valorUnitario * tipoIngresso[index].desconto,
                        dataUtilizacao: "2024-05-15T00:00:00",
                        codigoQr: '',
                        ativo: 1
                    });
                }
            });

            localStorage.setItem('pedido', JSON.stringify({
                quantidade: valoresIngressosSelecionados.reduce((a, b) => a + b, 0),
                total: getSum()
            }));
            localStorage.setItem('ingressos', JSON.stringify(tipoIngresso.map((tipo, index) => ({
                tipo: tipo.nome,
                valor: tipo === 'Infantil' ? 5 : loteAtual.valorUnitario * tipo.desconto,
                quantidade: valoresIngressosSelecionados[index],
            }))));
    
            await fetch(`${url}Ingresso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingressos)
            });

            // Display success toast notification
            toast.success('Pedido e ingressos criados com sucesso!');
            //2s time and redirect to /meusIngressos
            setTimeout(() => {
                navigate('/detalhes');
            }, 2000);


        } catch (error) {
            // Display error toast notification
            toast.error('Erro ao criar pedido e ingressos.');
            console.error('Erro ao criar pedido e ingressos:', error);
        }
    }

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            setErrorMessage('');
        }
    }, [errorMessage]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setSuccessMessage('');
            setTimeout(() => {
                navigate('/detalhes');
            }, 2000);
        }
    }, [successMessage, navigate]);

    return (
        <>
            <Cabecalho />
            <div className="container-fluid bg-light py-5">
                <div className='container'>
                    {/* <div className="row mb-4">
                        <div className="col-12 text-center">
                            <img src={evento.imagem} alt="Imagem do evento" className="img-fluid" />
                        </div>
                    </div> */}
                    
                    <div>
                        <div className="col-12">
                            <div className="card">
                                {/* <img src={evento.imagem} alt="Imagem do evento" /> */}
                                
                                <img src={imgBanner} alt="Imagem do evento" className="card-img-top"/>

                                <div className="card-body">
                                    <h3 className="card-title">{evento.nomeEvento}</h3>
                                    <p className="card-text">

                                        <div className="d-flex align-items-center my-3">
                                            <img src={agendaIcon} alt="Agenda" className="me-2" height={24} />
                                            <p className="mb-0 fs-5">
                                                {new Date(evento.dataEvento).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="d-flex align-items-center my-3">
                                            <img src={localIcon} alt="Local" className="me-2" height={24}/>
                                            <p className="mb-0 fs-5">{evento.local}</p>
                                        </div> 

                                        <h4 className="card-title">Informações</h4>
                                        <hr/>

                                        <p>{evento.descricao}</p>

                                    </p>                                
                                </div>
                            </div>
                        </div>
                       
                        <div className="col-12 mt-4">
                            <div class="card">
                                <h5 class="card-header text-bg-primary mb-3">Como participar?</h5>
                                <div class="card-body">
                                    <h5 class="card-title">Reserva do Ingresso</h5>
                                    <p class="card-text"><li>É muito simples, escolha os tipos de ingresso abaixo antes que acabe e clique no botão "Reservar Ingresso"</li></p>
                                    
                                    <h5 class="card-title">Como pago?</h5>
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
                        <div className="col-12 mt-4">
                            <div className="card">
                                <h4 className="card-header text-bg-primary mb-3"
                                                style={{color: '#0a0a0a', opacity: '1'}}>Reserva de ingressos</h4>
                                <div className="card-body">
                                    {loteAtual.idLote ? (
                                        <>

                                            

                                            <h4 className="mb-4 fs-4">{loteAtual.nome} (<span className="text-muted">{loteAtual.saldo} Ingressos disponíveis</span>)</h4>
                                            
                                            {loteAtual.tipo === 'Tempo' ? <p className="text-muted fs-5">Válido
                                                até {new Date(loteAtual.dataFim).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    }
                                                )}</p> : null}

                                            {loteAtual.valorUnitario === 0 ?
                                                <p className="text-muted fs-5">Gratuito</p> :
                                                <p className="text-muted fs-5">{Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(loteAtual.valorUnitario)}</p>}
                                            <hr/>

                                            {tipoIngresso.map((tipo, index) => (
                                                <div key={index} className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h5 className="mb-0 fs-5">{tipo.nome}</h5>
                                                            <p className="mb-0 text-muted">
                                                                {tipo.desconto === 0 ? 'Gratuito' : Intl.NumberFormat('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL'
                                                                }).format(tipo.nome === 'Infantil' ? 5 : loteAtual.valorUnitario * tipo.desconto)}</p>
                                                        </div>
                                                        <div className="d-flex align-items-center">

                                                            <button className="btn btn-danger"
                                                                    onClick={() => {
                                                                        if (valoresIngressosSelecionados[index] > 0) {
                                                                            const valores = [...valoresIngressosSelecionados];
                                                                            valores[index] -= 1;
                                                                            setValoresIngressosSelecionados(valores);
                                                                            setLoteAtual(prevState => ({
                                                                                ...prevState,
                                                                                saldo: Math.min(prevState.saldo + 1, loteAtual.saldo + 1) // Ensure saldo doesn't exceed loteAtual.saldo
                                                                            }));
                                                                        }
                                                                    }}>
                                                                <i className="bi bi-dash"></i>
                                                            </button>
                                                            <span
                                                                className="mx-2">{valoresIngressosSelecionados[index]}</span>
                                                            <button className="btn btn-success"
                                                                    onClick={() => {
                                                                        const totalIngressos = valoresIngressosSelecionados.reduce((a, b) => a + b, 0);
                                                                        if (loteAtual.saldo > 0 && totalIngressos < 10) {
                                                                            const valores = [...valoresIngressosSelecionados];
                                                                            valores[index] += 1;
                                                                            setValoresIngressosSelecionados(valores);
                                                                            setLoteAtual(prevState => ({
                                                                                ...prevState,
                                                                                saldo: Math.max(prevState.saldo - 1, 0) // Ensure saldo doesn't go below 0
                                                                            }));
                                                                        }
                                                                    }}>

                                                                <i className="bi bi-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <hr/>

                                                </div>
                                            ))}

                                            <div className="d-flex justify-content-between align-items-center mt-4">
                                                <h4>Total</h4>
                                                <h4>{Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(getSum())}</h4>
                                            </div>

                                            <button className="btn btn-success w-100 mt-3 botaoVerde fs-5" onClick={handleOpenConfirmationModal}>Reservar Ingresso</button>

                                        </>) : (
                                        <p className="text-muted fs-3">Nenhum lote ativo disponível</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                show={showConfirmationModal}
                handleClose={handleCloseConfirmationModal}
                handleConfirm={handleConfirmReservation}
                handleCancel={handleCancelReservation}
                pedido={{
                    quantidade: valoresIngressosSelecionados.reduce((a, b) => a + b, 0),
                    total: getSum()
                }}
                ingressos={tipoIngresso.map((tipo, index) => ({
                    tipo: tipo.nome,
                    valor: tipo === 'Infantil' ? 5 : loteAtual.valorUnitario * tipo.desconto,
                    quantidade: valoresIngressosSelecionados[index]
                }))}
            />
            <Rodape/>
            <ToastContainer/>
        </>
    );
}

export default InicioReservaPage;
