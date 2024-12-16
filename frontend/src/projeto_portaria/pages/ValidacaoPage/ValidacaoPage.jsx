import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '../../components/Utils/auth';
import Cabecalho from '../../components/Cabecalho/Cabecalho';
import Rodape from '../../components/Rodape/Rodape';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ValidacaoPage.css';

const Validacao = () => {
  const navigate = useNavigate();

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = () => {
    if (!isAuthenticated()) {
      console.log('Usuário não autenticado');
      navigate('/');
    }
  };

  const onLogoff = () => {
    localStorage.clear();
    navigate('/');
  };

  const onEnviar = () => {
    console.log('TESTE');
  };
  return (
    <>
 <Cabecalho />
      <div className="container d-flex mb-5 mt-5 flex-column align-items-center justify-content-center pt-5 pb-5" style={{ paddingBottom: '600px' }}>
        <div className="text-center mb-4">
          <h1>Validar Ingresso</h1>
        </div>
        <div className="card mx-auto mb-1" style={{ width: '300px', height: '300px', backgroundColor: '#f0f0f0', border: '0px', borderRadius: '15px' }}>
          <div className="card-body d-flex flex-column align-items-center justify-content-center">
            <Link onClick={onEnviar} to="/portaria/camera" className="btn btn-success btn-lg" style={{ width: '200px', height: '50px', backgroundColor: '#6ce354', borderColor: '#d1ecc3' }}>
              Validar Ingresso
            </Link>
          </div>
        </div>
        <div className="text-center">
          <button onClick={onLogoff} className="btn btn-danger mb-1 mt-3" style={{ width: '300px', height: '40px', backgroundColor: '#e35146', borderColor: '#f7a7a2' }}>
            Sair
          </button>
        </div>
      </div>
      <Rodape />
    </>
  );
};
export default Validacao;