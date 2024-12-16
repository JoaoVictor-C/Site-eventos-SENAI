import './LoginPageAdmin.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { notifyError } from '../../components/Utils/msgToast.jsx';
import Cabecalho from '../../components/Menu/index.jsx';
import Rodape from '../../components/Rodape/index.jsx';
import { isAuthenticated } from '../../components/Utils/auth.jsx';
import constantes from "../../../componentes/Constantes.jsx";


const LoginPageAdmin = () => {  
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');    
    const inDevelopment = localStorage.getItem('inDevelopment');
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();

    const verificarAutenticacao = () => {
        if (isAuthenticated()) {
            console.log('Usuário autenticado');
            navigate('/admin/inicioadmin');
        }
    }

    useEffect(() => {
        verificarAutenticacao();
    }, []);



    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    const getLogin = async () => {
        
        const credencial = {
            'email': email,
            'senha': senha
        }
        try { 
            const response = await fetch(url + 'Usuario/login', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credencial)
            }).then(response => response.json())
        const data = await response;

            localStorage.setItem('email', data.email);
            localStorage.setItem('id', data.idUsuario);
            localStorage.setItem('nomeCompleto', data.nomeCompleto);
            localStorage.setItem('perfil', data.perfil);
            localStorage.setItem('telefone', data.telefone);
            localStorage.setItem('ativo', data.ativo);

            navigate('/admin/inicioadmin');

        } catch (error) {
            notifyError("Usuário ou senha inválidos ")
        }
    };

    const onAlterar = (event) => {
        const { id, value } = event.target;
        if (id === 'email') {
            setEmail(value);
        } else {
            setSenha(value);
        }
    };

    const onEnviar = () => {
        if (email === '' || senha === '') {
            notifyError("Preencha todos os campos!")
        } else {            
            getLogin()
        }        
    };

    const HandleKeyDown = (event) => {
        if(event.key === 'Enter') {
            onEnviar();
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Cabecalho />
            <div className='container mt-5 mb-5 shadow-lg p-5 bg-body rounded' style={{ maxWidth: '400px' }}>
                <div className='row justify-content-center'>
                    <div className='col'>
                        <div className='text-center'>
                            <h1 className='fs-1'>Login</h1>
                            <p className='lead'>Preencha os campos abaixo</p>
                        </div>
                        <div className='mb-3'>
                            <input type='text' className='form-control' id='email' placeholder='E-mail' onChange={onAlterar} onKeyDown={HandleKeyDown} />
                        </div>
                        <div className='mb-3 input-group'>
                            <input type={showPassword ? 'text' : 'password'} className='form-control' id='senha' placeholder='Senha' onChange={onAlterar} onKeyDown={HandleKeyDown} />
                            <span className={`input-group-text btn btn-outline-secondary border border-1 ${showPassword ? 'border-danger' : ''}`} onClick={toggleShowPassword}>
                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                            </span>
                        </div>
                        <div className='d-grid gap-2'>
                            <button type='button' className='btn btn-primary fs-5' onClick={onEnviar}>Acessar</button>
                        </div>
                    </div>
                </div>
            </div>

            <Rodape />

            <ToastContainer />

        </>
    );
}

  
export default LoginPageAdmin;