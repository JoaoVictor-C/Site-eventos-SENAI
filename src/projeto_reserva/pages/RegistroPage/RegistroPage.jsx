import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';
import Cabecalho from '../../Components/Cabecalho/Cabecalho.jsx';
import Rodape from '../../Components/Rodape/Rodape.jsx';
import constantes from '../../../componentes/Constantes.jsx'

const RegistroPage = () => {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({ idUsuario: '0', email: '', nomeCompleto: '', senha: '', telefone: '', perfil: 'Usuario', ativo: 1 });
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const inDevelopment = localStorage.getItem('inDevelopment');
    var url = ''
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }

    const notifyError = (msg) => 
        toast.error(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
  
    const notifySuccess = (msg) =>
        toast.success(msg, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
        });

    const getCadastrar = async () => {
        try {
            let credencial = usuario;
            // Iremos verificar se o email está de acordo com o padrão
            //Padrão: (qualquer coisa)@(qualquer coisa).(qualquer coisa)
            let email = usuario.email;
            let padraoEmail = /\S+@\S+\.\S+/;
            if (!padraoEmail.test(email)) {
                notifyError("Email inválido");
                return;
            }
            
            const response = await fetch(url + 'Usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credencial)
            });

            notifySuccess("Usuário registrado com sucesso");

            setTimeout(() => {
                navigate('/login');
            }, 2000); 

        } catch (error) {
            notifyError("Falha no registro de usuário");
        }
    };

    const onAlterar = (event) => {
        const { name, value } = event.target;
        setUsuario(usuario => ({ ...usuario, [name]: value }));

        if (name === 'confirmarSenha') {
            setConfirmarSenha(value);
        }
    };

    const onEnviar = () => {
        if (usuario.email === '' || usuario.nomeCompleto === '' || usuario.senha === '' || usuario.telefone === '') {
            notifyError("Preencha todos os campos");
            return;
        }
        if (usuario.senha !== confirmarSenha) {
            notifyError("As senhas não conferem");
            return;
        }

        getCadastrar();
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


    return (
        <>
            <Cabecalho />
            <div className='container mt-4 mb-4 shadow-lg p-5 bg-body rounded' style={{ maxWidth: '400px' }}>
                <div className='row justify-content-center'>
                    <div className='col'>
                        <div className='text-center'>
                            <h1 className='fs-1'>Registro</h1>
                            <p className='lead'>Preencha os campos abaixo</p>
                        </div>
                        <div className='mb-3'>
                            <input type='text' className='form-control' id='nomeCompleto' placeholder='Nome Completo' name='nomeCompleto' onChange={onAlterar} />
                        </div>
                        <div className='mb-3'>
                            <InputMask mask="+55 (99) 99999-9999" maskChar=" " className='form-control' id='telefone' placeholder='Telefone' name='telefone' onChange={onAlterar} />
                        </div>
                        <div className='mb-3'>
                            <input type='email' className='form-control' id='email' placeholder='E-mail' name='email' onChange={onAlterar}/>
                        </div>
                        <div className='mb-3 input-group'>
                            <input type={showPassword ? 'text' : 'password'} className='form-control' id='senha' placeholder='Senha' name='senha' onChange={onAlterar} />
                            <span className={`input-group-text btn btn-outline-secondary border border-1 ${showPassword ? 'border-danger' : ''}`} onClick={toggleShowPassword}>
                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                            </span>
                        </div>
                        <div className='mb-3 input-group'>
                            <input type={showConfirmPassword ? 'text' : 'password'} className='form-control' id='confirmarSenha' placeholder='Confirmar Senha' name='confirmarSenha' onChange={onAlterar} />
                            <span className={`input-group-text btn btn-outline-secondary border border-1 ${showConfirmPassword ? 'border-danger' : ''}`}
                             onClick={toggleShowConfirmPassword}>
                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                            </span>
                        </div>
                        <div className='d-grid gap-2'>
                            <button type='button' className='btn btn-primary fs-5' onClick={onEnviar}>Cadastrar</button>
                        </div>
                    </div>
                </div>
                <div className='row justify-content-center'>
                    <div className='col d-flex justify-content-center flex-column'>
                        <p className='text-center'>Já tem uma conta?</p>
                        <a href="/login" className='text-center text-decoration-none m-0 p-0 btn btn-link'>Faça login aqui.</a>
                    </div>
                </div>
            </div>
            <Rodape />
            <ToastContainer />
        </>
    );
}

export default RegistroPage;
