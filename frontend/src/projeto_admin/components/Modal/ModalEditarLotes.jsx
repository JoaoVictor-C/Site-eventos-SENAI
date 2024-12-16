import InputMask from 'react-input-mask';
import { useState } from 'react';

export const ModalEditarLotes = ({ handleSalvar, handleDeletar, lotes, setSelectedLote }) => {

    const [valueQuantity, setValueQuantity] = useState('');


    const handlePriceChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        setValueQuantity(value);
    };

    return (
        <div className="modal fade" id="modalLotes" tabIndex="-1" aria-labelledby="modalLotesLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="modalLotesLabel">Editar Lotes</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <select className="form-select" id="lote" onChange={() => {
                            setSelectedLote(document.getElementById('lote').value);
                            lotes.map((item) => {
                                if (item.idLote === parseInt(document.getElementById('lote').value)) {
                                    let ativo = item.ativo === 1 ? true : false;
                                    setValueQuantity(item.valorUnitario);
                                    document.getElementById('quantidadeTotal').value = item.quantidadeTotal;
                                    document.getElementById('saldo').value = item.saldo;
                                    document.getElementById('ativo_lote').checked = ativo;
                                    document.getElementById('dataInicio').value = item.dataInicio.split('T')[0];
                                    document.getElementById('dataFinal').value = item.dataFinal.split('T')[0];
                                    document.getElementById('tipo').value = item.tipo;
                                    document.getElementById('nomeLote').value = item.nome;
                                    if (document.getElementById('tipo').value === "quantidade" || document.getElementById('tipo').value === "gratis") {
                                        document.getElementById('dataInicio').parentElement.style.display = 'none';
                                        document.getElementById('dataFinal').parentElement.style.display = 'none';
                                    } else {
                                        document.getElementById('dataInicio').parentElement.style.display = 'block';
                                        document.getElementById('dataFinal').parentElement.style.display = 'block';
                                    }
                                    if (document.getElementById('tipo').value === "gratis") {
                                        document.getElementById('valorUnitario').parentElement.style.display = 'none';
                                        document.getElementById('valorUnitario').value = 0;
                                        const dataEvento = document.getElementById('data').value;
                                        document.getElementById('dataInicio').value = dataEvento;
                                        document.getElementById('dataFinal').value = dataEvento;
                                    } else {
                                        document.getElementById('valorUnitario').parentElement.style.display = 'block';
                                    }
                                }
                                return null;
                            });
                        }}>
                            {lotes.length === 0 ? <option value="0" style={{ display: 'none' }}>Sem lotes</option> : <option value="0" style={{ display: 'none' }}>Selecione um lote</option>}
                            {
                                lotes.map((item, index) => {
                                    return (
                                        <option key={item.idLote} value={item.idLote}>{item.nome}</option>
                                    );
                                })
                            }
                        </select>
                        <br />
                        <form>
                            <div className="mb-3">
                                <label htmlFor="nomeLote" className="form-label">Nome do lote</label>
                                <input type="text" className="form-control" id="nomeLote" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="valorUnitario" className="form-label">Valor Unitário</label>
                                <InputMask
                                    mask="99,99"
                                    value={valueQuantity}
                                    onChange={handlePriceChange}
                                    className="form-control"
                                    id="valorUnitario"
                                    required
                                    placeholder="R$ 0,00"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="quantidadeTotal" className="form-label">Quantidade Total</label>
                                <input type="number" className="form-control" id="quantidadeTotal" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="saldo" className="form-label">Saldo</label>
                                <input type="number" className="form-control" id="saldo" required />
                            </div>
                            <div className="mb-3">
                                <input type="checkbox" className="form-check-input me-2" id="ativo_lote" required />
                                <label className="form-check-label" htmlFor="ativo_lote">Ativo</label>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dataInicio" className="form-label">Data Início</label>
                                <input type="date" className="form-control" id="dataInicio" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dataFinal" className="form-label">Data Final</label>
                                <input type="date" className="form-control" id="dataFinal" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="tipo" className="form-label">Tipo</label>
                                <select className="form-select" id="tipo" disabled>
                                    <option value="quantidade">Quantidade</option>
                                    <option value="gratis">Gratis</option>
                                    <option value="tempo">Data</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={handleDeletar} data-bs-dismiss="modal" id="deletarLote">Deletar</button>
                        <button type="submit" className="btn btn-primary" onClick={handleSalvar} id="salvarLote">Salvar</button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="fecharModalLotes">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
