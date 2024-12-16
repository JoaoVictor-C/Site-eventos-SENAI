

import React, { useState } from "react";
import CampoTexto from "../../components/CampoTexto/CampoTexto";
import "../../components/CampoTexto/CampoTexto.jsx";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { notifyError } from "../../components/Utils/msgToast.jsx";
import { ToastContainer } from "react-toastify";
import "./TenteNovamentePage.css";
import Cabecalho from "../../components/Cabecalho/Cabecalho.jsx";
import { Link } from "react-router-dom";
import Camera from "../../components/Camera/Camera";
import { useEffect } from "react";
import { isAuthenticated } from "../../components/Utils/auth.jsx";
import Rodape from "../../components/Rodape/Rodape.jsx";


function TenteNovamentePage() {
  const [codigo, setCodigo] = useState("");

  function onEnviar() {
    console.log("TESTE");
  }

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

  const onValidar = async () => {
    try {
      const campoQr = document.getElementById('input');
      const valido = await verificaCodigo(codigo);
      console.log(valido);
      if (valido == true) {
        navigate("/confirmacao");
      } else {
        notifyError("Código inválido. Tente novamente.");
      }
    } catch (error) {
      notifyError("Ocorreu um erro ao verificar o código. Tente novamente.");
    }
  };

  const verificaCodigo = async (valido) => {
    try {
      const response = await fetch(
        https,//www.senailp.com.br/eventos-api/api/Ingresso/Verifica/${valido},
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      if (response.ok === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      throw error;
    }
  };

  return (
    <>
<Cabecalho />
<div className="container d-flex mb-5 mt-5 flex-column align-items-center justify-content-center pt-5 pb-5" style={{paddingBottom: '600px'}}>
        <div className="card text-center mb-5" style={{ width: '100%', maxWidth: '600px', backgroundColor: '#f0f0f0', border:'0px' }}>
          <div className="card-body">
            <h5 className="card-title">Leitura Inválida</h5>
            <Link onClick={() => console.log("TESTE")} to="/qrpage" className="btn btn-primary my-3" style={{display: "block", justifyContent: "center", alignItems: "center",}}>
              Abrir Câmera Novamente
            </Link>
            <h5 className="card-ou">OU</h5>
            <div className="d-flex justify-content-center mb-3">
              <CampoTexto place="Digite o código do convite" value={codigo} aoAlterar={setCodigo} className="w-75" />
            </div>
            <button className="btn btn-success my-3" style={{ background: '#6ce354', border: '0px'}} onClick={onValidar}>Validar</button>
          </div>
        </div>
      </div>
      <ToastContainer />
      <Rodape/>
    </>
  );
}



export default TenteNovamentePage;