/*
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import Cabecalho from '../../components/Cabecalho/Cabecalho';
import imgCabecalho from '../../assets/images/imgCabecalho.png';

function QrPage() {
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        getLerQrCode();
    }, []);

    const getLerQrCode = () => {
        if (!scannerRef.current) {
            const html5QrCodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: 400 }
            );

            scannerRef.current = html5QrCodeScanner;

            html5QrCodeScanner.render(onScanSuccess, onScanError);
        }

       
        return () => {
           
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        };
    };

    const onScanSuccess = (decodedText, decodedResult) => {
      
        const resultadoQrCode = document.getElementById('resultadoQrCode');
        resultadoQrCode.innerText = decodedText;

       
        if (decodedText === "Lara") {
            window.location.href = "/confirmacao";
        }

       
        const timeoutId = setTimeout(() => {
           
            window.location.href = "/invalido";
        }, 60000); // 60000 milissegundos = 1 minuto

       
        return () => clearTimeout(timeoutId);
    };

    const onScanError = (errorMessage) => {
        
        console.error("Erro ao ler QR Code:", errorMessage);
    };

    return (
        <>
            <Cabecalho cabecalho={imgCabecalho} />
            <h1> Aponte o QR CODE </h1>
            <div className='bloco_cz'>
                <div ref={videoRef} id="reader" style={{ width: '400px', height: '400px' }}></div>
            </div>
            <div id='resultadoQrCode'></div>
        </>
    );
}

export default QrPage;
*/

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Cabecalho from "../../components/Cabecalho/Cabecalho";
import { isAuthenticated } from "../../components/Utils/auth.jsx";
import { useNavigate } from "react-router-dom";
import Rodape from "../../components/Rodape/Rodape.jsx";

const QrPage = () => {
  const navigate = useNavigate();
  const [errorApi, setErroApi] = useState(false);
  const [msgApi, setmsgApi] = useState("");

  const verificarAutenticacao = () => {
    if (!isAuthenticated()) {
      console.log("Usuário não autenticado");
      navigate("/");
    }
  };

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    getLerQrCode();
  }, []);

  const getLerQrCode = () => {
    if (!scannerRef.current) {
      const html5QrCodeScanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 400,
      });

      scannerRef.current = html5QrCodeScanner;

      html5QrCodeScanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    const resultadoQrCode = document.getElementById("resultadoQrCode");
    resultadoQrCode.innerText = decodedText;

    let resultado = await verificaQRCODE(decodedText);
    //console.log(resultado)
    if (resultado) {
      window.location.href = "/confirmacao";
    } else {
      window.location.href = "/invalido";
    }
    const timeoutId = setTimeout(() => {
      window.location.href = "/invalido";
    }, 60000);

    return () => clearTimeout(timeoutId);
  };

  const verificaQRCODE = async (qrCodeLido) => {
    try {
      const response = await fetch(
        `https://www.senailp.com.br/eventos-api/api/Ingresso/Verifica/${qrCodeLido}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      const data = await response.json();

      if (response.mensagem === "Acesso concedido!") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      //notifyError("Usuário ou senha inválidos " + error);
      return false;
    }
  };

  const onScanError = (errorMessage) => {
    // Lógica a ser executada em caso de erro ao ler um código QR
    console.error("Erro ao ler QR Code:", errorMessage);
  };

  return (
    <>
     <Cabecalho />
     <div className="container d-flex mb-5 mt-5 flex-column align-items-center justify-content-center pt-5 pb-5" style={{paddingBottom: '600px'}}>
        <div className="row justify-content-center">
          <div className="col text-center">
            <h1 className="p-4">Aponte o QR CODE</h1>
            <div className="bloco_czc pb-5 d-flex justify-content-center">
              <div
                ref={videoRef}
                id="reader"
                style={{ width: "400px", height: "400px" }}
              ></div>
            </div>
            <div id="resultadoQrCode"></div>
          </div>
        </div>
      </div>
      <Rodape />
    </>
  );
};

export default QrPage;