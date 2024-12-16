import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cabecalho from "../../components/Cabecalho/Cabecalho";
import Rodape from "../../components/Rodape/Rodape";
import { isAuthenticated } from "../../components/Utils/auth.jsx";
import "./CameraPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import camera from "../../../assets/Images/camera.png"

const CameraPage = () => {
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

  const onEnviar = () => {
    console.log("TESTE");
  };

  return (
    <>
     <Cabecalho />
      <div className="container d-flex mb-1 mt-4 flex-column align-items-center justify-content-center pt-5 pb-5" style={{ paddingBottom: '600px' }}>
          <div className="col-auto text-center">
            <h1 className="va mt-3">Abrir a Câmera</h1>
            <Link onClick={onEnviar} to="/portaria/qrpage">
              <div className="cam d-flex flex-column align-items-center justify-content-center">
                <button className="btn btn-sm" style={{ padding: '25px 80px' }}>
                  <img src={camera} alt="ex" style={{ width: 70, height: 90 }} />
                </button>
              </div>
            </Link>
          </div>
      </div>
      <Rodape />
    </>
  );
};

export default CameraPage;
