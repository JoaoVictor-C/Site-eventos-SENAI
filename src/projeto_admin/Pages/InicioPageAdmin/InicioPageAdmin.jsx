import './InicioPageAdmin.css';
import Menu from '../../components/Menu/index.jsx';
import Rodape from '../../components/Rodape/index.jsx';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import constantes from "../../../componentes/Constantes.jsx";


const InicioPageAdmin = () => {
    const [eventos, setEventos] = useState([])
    const inDevelopment = localStorage.getItem('inDevelopment');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    var url = '';
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
        getEventos()
    }, [])


    return (
        <div>
            <Menu />
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
                    <div className='row'>
                        {eventos.map((dados, index) => (
                            <div key={index} className='col-lg-4 col-md-6 mb-4'>
                                <Link to={`/admin/graficos/${dados.idEvento}`} style={{ textDecoration: 'none' }} className='text-decoration-none'>
                                <div className='card p-4 m-2'>
                                <img src={dados.imagem} alt="Imagem do evento" className='card-img-top' />
                                <div className='card-body'>
                                    <p className='card-title fs-5'>{dados.nomeEvento}</p>
                                    <p className='card-text fs-5'>{dados.local}</p>
                                </div>
                            </div>
                            </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-center'>Nenhum evento disponível no momento.</p>
                )}
            </div>
            <Rodape />
        </div>
    )


}


export default InicioPageAdmin;