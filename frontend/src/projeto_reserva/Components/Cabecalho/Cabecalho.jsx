import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import senai_vermelho from '../../../assets/Images/senai_vermelho.png';
import perfil_pequeno from '../../../assets/Images/perfil_pequeno.png';
import { isAuthenticated } from '../Utils/auth.jsx';
import { useNavigate } from 'react-router-dom';
import './Cabecalho.css';

const Cabecalho = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();


    const onLogoff = () => {
        localStorage.setItem('email', '');
        localStorage.setItem('id', '');
        localStorage.setItem('nomeCompleto', '');
        localStorage.setItem('perfil', '');
        localStorage.setItem('telefone', '');
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className="container-fluid" style={{ borderTop: '14px solid red', borderBottom: '14px solid red', width: '100%', backgroundColor: "#F0F0F0" }}>
                <div className="p-3 pt-5 pb-5 row d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center justify-content-center col-4">
                        <img src={senai_vermelho} alt="Logo" className="img-fluid" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
                    </div>
                    <div className="col-6 d-flex align-items-center justify-content-center">
                        <div className="d-lg-none d-flex align-items-center">
                            <button className="hamburger-icon" onClick={toggleMenu} style={{ fontSize: "30px", border: 'none', backgroundColor: 'transparent' }}>
                                ☰
                            </button>
                            {isOpen && (
                                <div className="menu-items">
                                    <i className="bi bi-x btn btn-outline-dark" width="30" height="20" onClick={toggleMenu} style={{ fontSize: "30px", cursor: 'pointer' }}></i>
                                    <nav className="menu-mobile">
                                        <ul className="nav-mobile d-flex flex-column">
                                            <li className=" mb-3" style={{ listStyle: 'none' }}>
                                                <Link to="/" className="btn btn-outline-secundary fs-4">Eventos</Link>
                                            </li>
                                            <li className="mb-3" style={{ listStyle: 'none' }}>
                                                <Link to="/meusIngressos" className="btn btn-outline-secundary fs-4">Meus Ingressos</Link>
                                            </li>
                                            <li className=" mb-3" style={{ listStyle: 'none' }}>
                                                <Link to="/suporte" className="btn btn-outline-secundary fs-4">Fale conosco</Link>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                        <div className="d-none d-lg-block">
                            <nav className="menu-full">
                                <ul className="nav">
                                    <li className="nav-item">
                                        <Link to="/" className="nav-link fs-5">Eventos</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/meusIngressos" className="nav-link fs-5">Meus Ingressos</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/suporte" className="nav-link fs-5">Fale conosco</Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    <div className="col-2 d-flex align-items-center justify-content-center">
                        <Link to="/perfil">
                            <img src={perfil_pequeno} alt="Perfil" />
                        </Link>

                        {isAuthenticated() ? (
                            <button type='button' onClick={onLogoff} className="btn btn-link" style={{ textDecoration: 'none', fontSize: "18px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right me-2" viewBox="0 2 16 16">
                                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                                </svg>
                                Sair
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-link" style={{ textDecoration: 'none', fontSize: "18px" }}>
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cabecalho;
