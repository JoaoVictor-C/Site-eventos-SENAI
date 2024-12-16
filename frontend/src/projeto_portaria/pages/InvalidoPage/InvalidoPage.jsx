
import React from "react";
 
import Cabecalho from "../../components/Cabecalho/Cabecalho";
import Alert from "../../components/Alert/Alert";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../../components/Utils/auth.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Rodape from "../../components/Rodape/Rodape.jsx";
import exclamacao from '../../../assets/Images/exclamacao.png'
import 'bootstrap/dist/css/bootstrap.min.css';
 
 
const InvalidoPage = () => {
  const navigate = useNavigate();
 
  const verificarAutenticacao = () => {
    if (!isAuthenticated()) {
      console.log("Usuário não autenticado");
      navigate("/");
    }
  };
 
  useEffect(() => {
    verificarAutenticacao();
  }, []);
 
  function onEnviar() {
    console.log("TESTE");
  }
  return (
    <>
      <Cabecalho />
      <div className="container d-flex mb-5 mt-5 flex-column align-items-center justify-content-center pt-5 pb-5" style={{paddingBottom: '600px'}}>
        <div className="card text-center" style={{ width: 300, height: 350 }}>
          <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: "#ff9494", border: 0 }}>
            <h5 className="card-title">ERRO na Validação</h5>
            <img src={exclamacao} alt="ex" style={{ width: 70, height: 100 }} />
            <a href="/TenteNovamente" className="btn btn-primary mt-4" style={{ backgroundColor: "#EEEEEE", color: "black", border: "black" }}>Tentar Novamente</a>
          </div>
        </div>
      </div>
      <Rodape />
    </>
  );
};

export default InvalidoPage;