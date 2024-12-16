import InputMask from 'react-input-mask';
import { useState } from 'react';
export const ModalAdicionarLote = ({ handleAdicionar }) => {

    const [valueQuantity, setValueQuantity] = useState('');

    const handlePriceChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        setValueQuantity(value);
    };

    return (
        <div>
            <div className="modal fade" id="modalAdicionarLote" tabIndex="-1" aria-labelledby="modalAdicionarLote" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalAdicionarLote">Adicionar lote</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="tipoAdicionarLote" className="form-label">Tipo de lote</label>
                                    <select className="form-select" id="tipoAdicionarLote" required onChange={(e) => {
                                        if (e.target.value === 'quantidade' || e.target.value === 'gratis') {
                                            document.getElementById('dataInicioAdicionarLote').parentElement.style.display = 'none';
                                            document.getElementById('dataFinalAdicionarLote').parentElement.style.display = 'none';
                                        } else {
                                            document.getElementById('dataInicioAdicionarLote').parentElement.style.display = 'block';
                                            document.getElementById('dataFinalAdicionarLote').parentElement.style.display = 'block';
                                        }
                                        if (e.target.value === 'gratis') {
                                            document.getElementById('valorUnitarioAdicionarLote').parentElement.style.display = 'none';
                                            document.getElementById('valorUnitarioAdicionarLote').value = 0;
                                        } else {
                                            document.getElementById('valorUnitarioAdicionarLote').parentElement.style.display = 'block';
                                        }
                                    }}>
                                        <option value="quantidade" defaultChecked>Por quantidade</option>
                                        <option value="tempo">Por tempo</option>
                                        <option value="gratis">Gratuito</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="nomeLotAdicionarLotee" className="form-label">Nome do lote</label>
                                    <input type="text" className="form-control" id="nomeLoteAdicionarLote" name="nomeLoteAdicionarLote" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="quantidadeTotalAdicionarLote" className="form-label">Quantidade Total</label>
                                    <input type="number" className="form-control" id="quantidadeTotalAdicionarLote" name="quantidadeTotalAdicionarLote" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="valorUnitarioAdicionarLote" className="form-label">Valor Unitário</label>
                                    <InputMask
                                        mask="99,99"
                                        maskChar={null}
                                        onChange={handlePriceChange}
                                        value={valueQuantity}
                                        required
                                        name={"valorUnitarioAdicionarLote"}
                                        className="form-control"
                                        placeholder="R$ 0,00"
                                        id="valorUnitarioAdicionarLote"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="dataInicioAdicionarLote" className="form-label">Data de início</label>
                                    <input type="date" className="form-control" id="dataInicioAdicionarLote" name="dataInicioAdicionarLote" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="dataFinalAdicionarLote" className="form-label">Data final</label>
                                    <input type="date" className="form-control" id="dataFinalAdicionarLote" name="dataFinalAdicionarLote" required />
                                </div>
                                <div className="mb-3">
                                    <input type="checkbox" className="form-check-input me-2" id="ativo_loteAdicionarLote" name="ativo_loteAdicionarLote" defaultChecked />
                                    <label htmlFor="ativo_loteAdicionarLote" className="form-label">Ativo</label>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                    <button type="submit" className="btn btn-primary" onClick={handleAdicionar} data-bs-dismiss="modal">Adicionar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div id="confirmModal">
            </div>
        </div>
    );
}