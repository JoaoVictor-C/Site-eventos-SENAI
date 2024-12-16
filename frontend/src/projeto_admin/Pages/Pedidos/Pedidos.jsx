import { useState, useEffect } from 'react';
import { CampoFiltro } from "../../components/CampoFiltro/CampoFiltro.jsx";
import { ButtonFiltro } from "../../components/Buttons/ButtonFiltro.jsx";
import { TabelaFiltro } from "../../components/TabelaFiltro/TabelaFiltro.jsx";
import { ValidateButton } from "../../components/Buttons/ValidateButton.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Rodape from "../../components/Rodape/index.jsx";
import Menu from "../../components/Menu/index.jsx";
import { CancelButton } from "../../components/Buttons/CancelButton.jsx";
import InputMask from 'react-input-mask';
import constantes from "../../../componentes/Constantes.jsx";
import Modal from "bootstrap/js/dist/modal.js";


function Pedidos() {
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pedidoModal, setPedidoModal] = useState({});
    const [filterText, setFilterText] = useState("");
    const [id, setId] = useState(null);
    const [filters, setFilters] = useState({
        status: null,
        pendingYesterday: false,
    });
    const [filteredPedidos, setFilteredPedidos] = useState([]);
    const inDevelopment = localStorage.getItem('inDevelopment');
    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const validate = (id) => {
        let idUsuario = localStorage.getItem('id');

        fetch(url + 'Pedido/validar/' + id + `?validacaoIdUsuario=${idUsuario}`, {
            method: 'PUT',
        })
            .then(response => response.json())
            .then(data => {
                setSuccessMessage(`Pedido ${id} validado com sucesso!`);
                fetchPedidos();
            })
            .catch((error) => {
                setErrorMessage("Erro ao validar pedido!");
            });
    };


    const handleConfirmValidation = () => {
        validate(id);
        setShowConfirmationModal(false);
    };

    useEffect(() => {
        const modal = new Modal(
            document.getElementById(`confirmationModal-${id}`),
            {
                keyboard: false,
                backdrop: 'static'
            }
        );

        if (showConfirmationModal) {
            modal.show();
        } else {
            modal.hide();
        }
    }, [showConfirmationModal, id]);


    async function fetchPedidos() {
        const response = await fetch(url + 'Pedido');
        const data = await response.json();
        setPedidos(data);
        setFilteredPedidos(data);
    }

    async function fetchUsuarios() {
        const response = await fetch(url + 'Usuario');
        const data = await response.json();
        setUsuarios(data);
    }

    useEffect(() => {
        fetchUsuarios();
        fetchPedidos();
    }, []);

    const handleFilter = (type, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [type]: value,
        }));
    };

    const handlePendingYesterdayFilter = () => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            pendingYesterday: !prevFilters.pendingYesterday,
        }));
    };

    const applyFilters = (data) => {
        return data.filter((item) => {
            const matchesText = filterText === "" || usuarios.find((usuario) => usuario.idUsuario === item.usuariosId).nomeCompleto.toLowerCase().includes(filterText.toLowerCase());
            const matchesStatus = filters.status === null || item.status === filters.status;

            //Irá mostrar somente os pedidos que atrasarem o pagamento a mais de 24 horas e que ainda não foram cancelados ou validados para termos maior precisão na validação iremos considerar por horas e não dias
            let matchesPendingYesterday = true;
            if (filters.pendingYesterday) {
                const dataCadastro = new Date(item.dataCadastro);
                const dataAtual = new Date();
                const diferencaHoras = Math.abs(dataAtual - dataCadastro) / 36e5;
                matchesPendingYesterday = diferencaHoras > 24 && item.status !== 'Cancelado' && item.status !== 'Validado';
            }
            

            return matchesText && matchesStatus && matchesPendingYesterday;
        });
    };

    const handleClear = (type) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [type]: null,
        }));
    };

    useEffect(() => {
        setFilteredPedidos(applyFilters(pedidos));
    }, [filterText, filters, pedidos]);

    const handleValidate = (id, pedido) => {
        setId(id);

        setPedidoModal(pedido);
        setShowConfirmationModal(true);
    }

    const handleCancel = (id) => {
        let idUsuario = localStorage.getItem('id');
        fetch(url + 'Pedido/cancelar/' + id + `?cancelamentoIdUsuario=${idUsuario}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            setSuccessMessage(`Pedido ${id} cancelado com sucesso!`);
            fetchPedidos();
        })
        .catch((error) => {
            setErrorMessage("Erro ao cancelar pedido!");
        });
    }

    const renderizarDados = () => {
        return filteredPedidos.map((item) => {
            let nomeCompleto = 'Usuário não encontrado'
            let nomeAdmin = 'Nenhuma ação realizada'

            usuarios.forEach((usuario) => {
                if (usuario.idUsuario === item.usuariosId) {
                    nomeCompleto = usuario.nomeCompleto;
                }
                if (usuario.idUsuario === item.validacaoIdUsuario) {
                    nomeAdmin = usuario.nomeCompleto;
                }
            });

            const dataCadastro = new Date(item.dataCadastro).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const totalMasked = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(item.total);

            return (
                <tr key={item.idPedido}>
                    <td>{item.idPedido}</td>
                    <td>{nomeCompleto}</td>
                    <td>{dataCadastro}</td>
                    <td>{totalMasked}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.formaPagamento}</td>
                    <td>{item.status}</td>
                    <td>{nomeAdmin}</td>

                    { 
                        (item.validacaoIdUsuario == 0)
                        ? <>
                            <td><ValidateButton id={item.idPedido} validate={handleValidate} status={item.status} pedido={item} handleValidate={handleValidate} /></td>
                            <td><CancelButton id={item.idPedido} cancel={handleCancel} status={item.status} pedido={item} /></td>  
                         </>
                        : <td colSpan={2}>
                            {
                                (item.status === "Validado") 
                                ?
                                <div className='alert alert-success p-1' role="alert">
                                    <strong>Pedido Aprovado</strong>
                                </div>
                                :
                                <div className='alert alert-danger p-1' role="alert">
                                    <strong>Pedido Cancelado</strong>
                                </div>
                            }   
                         </td>                     
                    }
                    {/* { 
                        (item.validacaoIdUsuario == 0)
                        ? <td><CancelButton id={item.idPedido} cancel={handleCancel} status={item.status} pedido={item} /></td>
                        : <td><span className='btn btn-primary'>Realizada</span></td> 
                    
                    } */}
                </tr>
            );
        });
    };

    const tableFields = ["ID Pedido", "Nome usuário", "Data Cadastro", "Total pago", "Ingressos", "Forma de Pagamento", "Status", "Última Ação por", "Validar pedido", "Cancelar pedido"];

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            setErrorMessage('');
        }
        if (successMessage) {
            toast.success(successMessage);
            setSuccessMessage('');
        }
    }, [errorMessage, successMessage]);

    return (
        <div>
            <Menu />
            <div className="container">
                <h3 className="text-center">Pedidos</h3>
                <div className="row justify-content-center">
                    <div className="col-12">
                        <CampoFiltro placeholder="Pesquisar por nome de usuário" handleFilter={setFilterText} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <ButtonFiltro opcoes={["Validado", "Pendente", "Cancelado"]} handleFilter={(value) => handleFilter("status", value)} handleClear={() => handleClear("status")} />
                    </div>
                    <div className="col-12 col-md-6">
                        <ButtonFiltro opcoes={["Pagamento atrasado"]} handleFilter={handlePendingYesterdayFilter} handleClear={() => handleClear("pendingYesterday")} />
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-12">
                        <TabelaFiltro renderizarDados={renderizarDados} tableFields={tableFields} filteredData={filteredPedidos} />
                    </div>
                </div>
            </div>
            <Rodape />
            <ToastContainer />
            <div className="modal fade" id={`confirmationModal-${id}`} tabIndex="-1" aria-labelledby={`confirmationModalLabel-${id}`} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={`confirmationModalLabel-${id}`}>Confirmar {
                                status === 'Validado' ? 'Invalidação' : status === 'Pendente' ? 'Validação' : 'Invalidação'
                            }</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowConfirmationModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Tem certeza de que deseja {
                                status === 'Validado' ? 'invalidar' : status === 'Pendente' ? 'validar ' : 'invalidar '
                            } o pedido?
                            </p>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Pedido</h5>
                                    <p className="card-text">ID: {id}</p>
                                    <p className="card-text">Status: {status}</p>
                                    <p className="card-text">Data: {pedidoModal.dataCadastro}</p>
                                    <p className="card-text">Total: {pedidoModal.total}</p>
                                    <p className="card-text">Quantidade: {pedidoModal.quantidade}</p>
                                    <p className="card-text">Forma de pagamento: {pedidoModal.formaPagamento}</p>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setShowConfirmationModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmValidation} data-bs-dismiss="modal">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pedidos;
