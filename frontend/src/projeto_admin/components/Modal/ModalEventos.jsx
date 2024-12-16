import { useState } from 'react';

export const ModalEventos = ({ handleSalvar, handleDeletar, fetchImagem }) => {
    const [imagem, setImagem] = useState(null);

    const handleImagem = async (e) => {
        const file = e.target.files[0];
        const base64 = await convertBase64(file);
        setImagem(base64);
    };

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    return (
        <div className="modal fade" id="modal" tabIndex="-1" aria-labelledby="modal" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Editar Evento</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSalvar} encType="multipart/form-data">
                            <input type="hidden" id="idEvento" name="idEvento"/>
                            <div className="mb-3">
                                <label htmlFor="nome" className="form-label">Nome</label>
                                <input type="text" className="form-control" id="nome" name="nome"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="data" className="form-label">Data</label>
                                <input type="date" className="form-control" id="data" name="data"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="local" className="form-label">Local</label>
                                <input type="text" className="form-control" id="local" name="local"/>    
                            </div>
                            <div className="mb-3">
                                <label htmlFor="descricao" className="form-label">Descrição</label>
                                <input type="text" className="form-control" id="descricao" name="descricao"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="totalIngressos" className="form-label">Total Ingressos</label>
                                <input type="number" className="form-control" id="totalIngressos" name="totalIngressos" disabled/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="ativo" className="form-label" >Imagem</label>
                                <input type="file" className="form-control" accept="image/*" id="imagem" name="imagem"  onClick={handleImagem}/>
                                <img src={imagem} alt="Imagem do evento" className="img-fluid" id="imagem-preview"/>
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="ativo" name="ativo"/>
                                <label className="form-check-label" htmlFor="ativo">Ativo</label>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Salvar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handleDeletar}>Deletar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
