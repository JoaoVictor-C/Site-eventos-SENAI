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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
                                                    }).format(ingresso.valor)}</p>
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
                        <button type="button" className="btn btn-success" onClick={handleConfirm}>Confirmar</button>
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
    const url = inDevelopment === 'true' ? 'http://localhost:5236/api/' : 'https://www.senailp.com.br/eventos-api/api/';
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [reservationConfirmed, setReservationConfirmed] = useState(false);

    const [tipoIngresso, setTipoIngresso] = useState ([
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
    ])

    const handleOpenConfirmationModal = () => {
        //Se a soma dos ingressos for maior que o saldo disponível, não abre o modal, para fazer o calculo temos que somar a quantidade selecionada ao saldo, pois o saldo é dinamicamente alterado entao temos que somar a quantidade selecionada ao saldo
        if (valoresIngressosSelecionados.reduce((a, b) => a + b, 0) > (loteAtual.saldo + valoresIngressosSelecionados.reduce((a, b) => a + b, 0))) {
            setErrorMessage('Quantidade de ingressos selecionada maior que o saldo disponível');
            return;
        }
        
        setShowConfirmationModal(true);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
    };

    const handleConfirmReservation = async () => {
        await handleSubmit();
        setReservationConfirmed(true);
        handleCloseConfirmationModal();
    };

    const handleCancelReservation = () => {
        handleCloseConfirmationModal();
    };

    const verificarAutenticacao = () => {
        if (!isAuthenticated()) {
            console.log('Usuário não autenticado');
            navigate('/Login');
        }
    }

    const fetchDataEvento = async () => {
        const response = await fetch(`${url}Evento/${eventoId}`);
        const data = await response.json();
        setEvento(data);
    }

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
            total += valor * loteAtual.valorUnitario * tipoIngresso[index].desconto;
        });
        return total;
    }

    const handleSubmit = async () => {
        if (!localStorage.getItem('id')) {
            navigate('/Login');
            return;
        }
    
        const dataAtual = new Date().toISOString().split('T')[0];
    
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
                        valor: loteAtual.valorUnitario * tipoIngresso[index].desconto,
                        dataUtilizacao: "2024-05-15T00:00:00",
                        codigoQr: '',
                        ativo: 1
                    });
                }
            });
    
    
            await fetch(`${url}Ingresso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ingressos)
            });
    
            // Display success toast notification
            toast.success('Pedido e ingressos criados com sucesso!');
    
        } catch (error) {
            // Display error toast notification
            toast.error('Erro ao criar pedido e ingressos.');
            console.error('Erro ao criar pedido e ingressos:', error);
        }
    }
    

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setSuccessMessage('');
            setTimeout(() => {
                navigate('/meusIngressos');
            }, 2000);
        }
    }, [successMessage, navigate]);

    return (
        <>
            <Cabecalho />
            <div className="container-fluid bg-light py-5">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-12 text-center">
                            <img src={cardImage} className="img-fluid w-50" alt="Evento" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8">
                            <h1 className='m-0'>{evento.nomeEvento}</h1>
                            <div className="d-flex align-items-center my-3">
                                <img src={agendaIcon} alt="Agenda" className="me-2" />
                                <p className="mb-0">
                                    {new Date(evento.dataEvento).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="d-flex align-items-center my-3">
                                <img src={localIcon} alt="Local" className="me-2" />
                                <p className="mb-0">{evento.local}</p>
                            </div>
                            <h2>Descrição do evento</h2>
                            <p>{evento.descricao}</p>
                            <hr />
                        </div>
                        <div className="col-md-4 w-100">
                            <div className="card" style={{ backgroundColor: '#EEEEEE' }}>
                                <div className="card-body">
                                    <h3 className="mb-4 fs-3 color-primary" style={{ color: '#0a0a0a', opacity: '1' }}>Reserva de ingressos</h3>
                                    <h4 className="mb-4 fs-4">{loteAtual.nome}</h4>
                                    <p className="text-muted fs-5">{loteAtual.saldo} disponíveis</p>
                                    {loteAtual.valorUnitario === 0 ? <p className="text-muted fs-5">Gratuito</p> : <p className="text-muted fs-5">{Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(loteAtual.valorUnitario)}</p>}
                                    <hr />
                                    {tipoIngresso.map((tipo, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="mb-0 fs-5">{tipo.nome}</h5>
                                                    <p className="mb-0 text-muted">
                                                        {tipo.desconto === 0 ? 'Gratuito' : Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(loteAtual.valorUnitario * tipo.desconto)}</p>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                <button className="btn btn-outline-dark btn-sm" onClick={() => {
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
                                                    <i className="bi bi-patch-minus"></i>
                                                </button>
                                                <span className="mx-2">{valoresIngressosSelecionados[index]}</span>
                                                <button className="btn btn-outline-dark btn-sm" onClick={() => {
                                                    if (loteAtual.saldo > 0 && valoresIngressosSelecionados[index] < 5) {
                                                        const valores = [...valoresIngressosSelecionados];
                                                        valores[index] += 1;
                                                        setValoresIngressosSelecionados(valores);
                                                        setLoteAtual(prevState => ({
                                                            ...prevState,
                                                            saldo: Math.max(prevState.saldo - 1, 0) // Ensure saldo doesn't go below 0
                                                        }));
                                                    }
                                                }}>
                                                    <i className="bi bi-patch-plus"></i>
                                                </button>

                                                </div>
                                            </div>
                                            <hr />
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
                    valor: loteAtual.valorUnitario * tipo.desconto,
                    quantidade: valoresIngressosSelecionados[index]
                }))}
            />
            <Rodape />
            <ToastContainer />
        </>
    );
}

export default InicioReservaPage;
