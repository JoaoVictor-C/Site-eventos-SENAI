import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../components/Utils/auth.jsx';
import { ToastContainer } from 'react-toastify';
import Rodape from '../../components/Rodape/index.jsx';
import perfil_grande from '../../../assets/Images/perfil_grande.png';
import Menu from "../../components/Menu/index.jsx";

const PerfilPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = () => {
    if (!isAuthenticated()) {
      console.log('Usuário não autenticado');
      navigate('/Login');
    }
  }

  const nome = localStorage.getItem('nomeCompleto');
  const email = localStorage.getItem('email');
  const tel = localStorage.getItem('telefone');
  const perfil = localStorage.getItem('perfil');

  return (
    <div>
      <Menu />
      <div className='container mt-5'>
        <div className='row'>
          <div className='col-md-4'>
            <div className='imagem-lado-esquerdo text-center'>
              <h1 className='perfil'>Perfil</h1>
              <img src={perfil_grande} className='img-fluid mb-4' alt='Perfil' />
            </div>
          </div>
          <div className='col-md-8'>
            <div className='lado-direito'>
              <div className='card border-0'>
                <div className='card-body'>
                  <h2 className='card-title mb-4'>Informações Pessoais</h2>
                  <ul className='list-group list-group-flush'>
                    <li className='list-group-item fs-5 ps-0'>
                      <strong>Nome completo:</strong> {nome}
                    </li>
                    <li className='list-group-item fs-5 ps-0'>
                      <strong>Email:</strong> {email}
                    </li>
                    <li className='list-group-item fs-5 ps-0'>
                      <strong>Telefone:</strong> {tel}
                    </li>
                    <li className='list-group-item fs-5 ps-0'>
                      <strong>Tipo:</strong> {perfil}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Rodape />
      <ToastContainer />
    </div>
  );
}

export default PerfilPage;