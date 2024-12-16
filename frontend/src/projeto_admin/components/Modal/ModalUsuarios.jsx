import propTypes from 'prop-types';
import {useState} from "react";
import InputMask from 'react-input-mask';
import constantes from "../../../componentes/Constantes.jsx";
export const ModalUsuarios = ({setModalData, usuarios, setUsuarios, setSuccessMessage, setErrorMessage}) => {
    const inDevelopment = localStorage.getItem('inDevelopment');
    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    function editarUsuario(){
        const idUsuario = document.getElementById('idUsuario').value;
        const nomeCompleto = document.getElementById('nomeCompleto').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const telefone = document.getElementById('telefone').value;
        const perfil = document.getElementById('perfil').value;
        let ativo = document.getElementById('ativo').checked;

        if (ativo === true) {
            ativo = 1;
        } else {
            ativo = 0;
        }

        const JSONData = {
            idUsuario: idUsuario,
            nomeCompleto: nomeCompleto,
            email: email,
            senha: senha,
            telefone: telefone,
            perfil: perfil,
            ativo: ativo
        }

        fetch(url + 'Usuario/' + idUsuario, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSONData)
        })
            .then(response => response.json())
            .then(data => {
                setSuccessMessage('Usuário editado com sucesso!');
                console.log('Success:', data);
                const newUsuarios = usuarios.map((usuario) => {
                    if(usuario.idUsuario === idUsuario){
                        return JSONData;
                    }
                    return usuario;
                });

                setUsuarios(newUsuarios);
            })
            .catch((error) => {
                setErrorMessage('Erro ao editar usuário!');
                console.error('Error:', error);
            });

        setModalData(null);
    }

    function deletarUsuario(){
        fetch(url + 'Usuario/' + document.getElementById('idUsuario').value, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                setSuccessMessage('Usuário deletado com sucesso!');
                console.log('Success:', data);
            })
            .catch((error) => {
                setSuccessMessage('Usuário deletado com sucesso!');
                console.error('Error:', error);
            });

        const newUsuarios = usuarios.filter((usuario) => {
            return usuario.idUsuario !== document.getElementById('idUsuario').value;
        });

        setUsuarios(newUsuarios);

        setModalData(null);
    }
    return (
        <>
            <div className="modal fade" id="modal" tabIndex="-1" aria-labelledby="modal" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Editar Usuário</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="nomeCompleto" className="form-label">Nome Completo</label>
                                    <input type="text" className="form-control" id="nomeCompleto"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="email"/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="senha" className="form-label">Senha</label>
                                    <div className={"input-group"}>
                                        <input type={showPassword ? 'text' : 'password'} className='form-control' id='senha' placeholder='Senha' />
                                        <span className={`input-group-text btn btn-outline-secondary border border-1 ${showPassword ? 'border-danger' : ''}`} onClick={toggleShowPassword}>
                                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="telefone" className="form-label">Telefone</label>
                                    <InputMask mask="+55 (99) 99999-9999" maskChar=" " className='form-control' id='telefone' placeholder='Telefone' name='telefone' />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="perfil" className="form-label">Perfil</label>
                                    <select className="form-select" id="perfil">
                                        <option value="Administrador">Administrador</option>
                                        <option value="Portaria">Portaria</option>
                                        <option value="Usuario">Usuario</option>
                                    </select>
                                </div>
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="ativo"/>
                                    <label className="form-check-label" htmlFor="ativo">Ativo</label>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={editarUsuario}>Salvar</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={deletarUsuario}>Deletar</button>
                        </div>
                        <div id="idUsuario" className={"hidden"}></div>
                    </div>
                </div>
            </div>
        </>
    )
}

ModalUsuarios.propTypes = {
    setModalData: propTypes.func.isRequired,
    usuarios: propTypes.array.isRequired,
    setUsuarios: propTypes.func.isRequired,
};