import { useState } from 'react';
import InputMask from 'react-input-mask';

export const Lote = ({ tipo }) => {
    const [quantidade, setQuantidade] = useState(100);
    const [preco, setPreco] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const handleQuantityChange = (e) => {
        setQuantidade(e.target.value);
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        const unmaskedValue = value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        setPreco(unmaskedValue);
    };

    const formatPrice = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <>
            <fieldset className="border border-primary rounded p-4 mb-4">
                <legend className="text-primary fs-5">Lote {tipo === 'quantidade' ? 'por quantidade' : tipo === 'tempo' ? 'por tempo' : 'gratuito'}</legend>
                <p>Adicione informações sobre o lote</p>

                {tipo === 'quantidade' && (
                    <>
                        <div className="mb-3">
                            <label htmlFor="nomeLote" className="form-label">Nome do lote<strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="text" required name={"nomeLote"} className="form-control w-25"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="quantidadeIngressos" className="form-label">Quantidade de ingressos <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="number" value={quantidade} min={1} onChange={handleQuantityChange} required name={"quantidadeIngressos"} className="form-control w-25" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="valorIngresso" className="form-label">Valor do ingresso <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <div className="input-group mb-3 w-25">
                                <span className="input-group-text" id="inputGroup">R$</span>
                                <InputMask
                                    mask="99,99"
                                    maskChar={null}
                                    value={preco}
                                    onChange={handlePriceChange}
                                    required
                                    name={"valorIngresso"}
                                    className="form-control"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </>
                )}

                {tipo === 'tempo' && (
                    <>
                        <div className="mb-3">
                            <label htmlFor="nomeLote" className="form-label">Nome do lote<strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="text" required name={"nomeLote"} className="form-control w-25"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="quantidadeIngressos" className="form-label">Quantidade de ingressos <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="number" value={quantidade} min={1} onChange={handleQuantityChange} required name={"quantidadeIngressos"} className="form-control w-25" />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="dataInicio" className="form-label">Data de início <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="datetime-local" required name={"dataInicio"} min={today} className={"form-control DataInput w-25"} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="dataTermino" className="form-label">Data de término <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="datetime-local" required name={"dataTermino"} min={today} className={"form-control DataInput w-25"} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="valorIngresso" className="form-label">Valor do ingresso <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <div className="input-group">
                                <span className="input-group-text" id="inputGroup">R$</span>
                                <InputMask
                                    mask="99,99"
                                    maskChar={null}
                                    value={formatPrice(preco)}
                                    onChange={handlePriceChange}
                                    required
                                    name={"valorIngresso"}
                                    className="form-control w-25"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </>
                )}

                {tipo === 'gratis' && (
                    <>
                        <div className="mb-3">
                            <label htmlFor="nomeLote" className="form-label">Nome do lote<strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="text" required name={"nomeLote"} className="form-control w-25"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="quantidadeIngressos" className="form-label">Quantidade de ingressos <strong style={{color: 'red', fontWeight: 'normal' }}>*</strong></label>
                            <input type="number" value={quantidade} min={1} onChange={handleQuantityChange} required name={"quantidadeIngressos"} className="form-control w-25" />
                        </div>
                    </>
                )}
            </fieldset>
        </>
    );
}
