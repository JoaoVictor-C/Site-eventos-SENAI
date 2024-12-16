import { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import Modal from 'bootstrap/js/dist/modal';

export const CancelButton = ({ id, cancel, status, pedido }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleCancel = () => {
        setShowConfirmationModal(true);
    };

    const handleConfirmCancel = () => {
        cancel(id);
        setShowConfirmationModal(false);
    };

    useEffect(() => {
        const modal = new Modal(
            document.getElementById(`confirmationModalCancel-${id}`),
            {
                keyboard: false,
                backdrop: 'static'
            }
        )
        if (showConfirmationModal) {
            modal.show();
        } else {
            modal.hide();
        }
    }, [showConfirmationModal, id]);

    return (
        <>
            <button
                type="button"
                className={
                    `btn btn-${status === 'Cancelado' ? 'info disabled' : 'danger'}`
                }
                id={id}
                onClick={handleCancel}>
                {
                    status === 'Cancelado' ? 'Reverter' : 'Cancelar'
                }
            </button>

            <div className="modal fade" id={`confirmationModalCancel-${id}`} tabIndex="-1" aria-labelledby={`confirmationModalLabel-${id}`} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id={`confirmationModalLabel-${id}`}>Confirmar {
                                status === 'Validado' ? 'Cancelamento' : status === 'Pendente' ? 'Cancelamento' : 'Cancelamento'
                            }</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowConfirmationModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Tem certeza de que deseja {
                                    status === 'Cancelado' ? 'reverter ' : 'cancelar '
                                } o pedido?
                            </p>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Pedido</h5>
                                    <p className="card-text">ID: {id}</p>
                                    <p className="card-text">Status: {status}</p>
                                    <p className="card-text">Data: {pedido.dataCadastro}</p>
                                    <p className="card-text">Total: {pedido.total}</p>
                                    <p className="card-text">Quantidade: {pedido.quantidade}</p>
                                    <p className="card-text">Forma de pagamento: {pedido.formaPagamento}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModal(false)} data-bs-dismiss="modal"
                            >Fechar</button>
                            <button type="button" className={`btn btn-${status === 'Cancelado' ? 'info' : 'danger'}`}
                             onClick={handleConfirmCancel} data-bs-dismiss="modal">Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CancelButton.propTypes = {
    id: propTypes.number.isRequired,
    cancel: propTypes.func.isRequired,
    status: propTypes.string.isRequired,
    pedido: propTypes.object.isRequired
};
// Path: src/projeto_admin/components/Buttons/CancelButton.jsx