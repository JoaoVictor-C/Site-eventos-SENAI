import { useState, useEffect } from 'react';
import Cabecalho from '../../Components/Cabecalho/Cabecalho.jsx';
import Rodape from '../../Components/Rodape/Rodape.jsx';
import Card from '../../Components/Card/Card.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InicioPage.css';
import constantes from '../../../componentes/Constantes.jsx'

const InicioPageReserva = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const inDevelopment = localStorage.getItem('inDevelopment');
    let url = '';
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

    const getImagem = async (idEvento) => {
        try {
            const response = await fetch(url + `Evento/${idEvento}/image`);
            const data = await response.blob();
            return URL.createObjectURL(data);
        } catch (error) {
            console.error('Erro ao buscar imagem do evento:', error);
        }
    }


    const getEventos = async () => {
        try {
            const response = await fetch(url + 'Evento');
            const data = await response.json();
            for (let i = 0; i < data.length; i++) {
                data[i].imagem = await getImagem(data[i].idEvento);
                console.log(`Imagem do evento ${data[i].idEvento}: ${data[i].imagem}`);
            }
            setEventos(data);
        } catch (error) {
            setError(error);
            notifyError("Erro ao carregar eventos da API ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEventos();
    }, []);

    return (
        <>
            <Cabecalho />
            <div className='container mt-4 mb-4'>
                <h1 className='InicioPageTitulo text-center mb-4'>Eventos Disponíveis</h1>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <p className='text-center text-danger'>Erro ao carregar eventos. Por favor, tente novamente mais tarde.</p>
                ) : eventos.length > 0 ? (
                    <div className='col-12'>
                        {eventos.map((item, index) => (
                            <div key={index} className='col-lg-4 col-md-6 mb-4'>
                                <Card dados={item} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-center'>Nenhum evento disponível no momento.</p>
                )}
            </div>
            <Rodape />
            <ToastContainer />
        </>
    );
};

export default InicioPageReserva;
