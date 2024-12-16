import React, { useState, useEffect } from 'react';
import CampoFiltro from '../../Components/CampoFiltro/CampoFiltro';
import Ingresso from '../../Components/Ingresso';
import Cabecalho from '../../Components/Cabecalho/Cabecalho';
import Rodape from '../../Components/Rodape/Rodape';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../Components/Utils/auth.jsx';
import pix from '../../../assets/Images/pix.png'
import constantes from "../../../componentes/Constantes.jsx";

function MeusIngressos() {
    const navigate = useNavigate();
    const [ingressos, setIngressos] = useState([]);
    const [filteredIngressos, setFilteredIngressos] = useState([]);
    const [filtroDescricao, setFiltroDescricao] = useState("");
    const [filtroStatus, setFiltroStatus] = useState(null); // Estado para o filtro de status
    const [descricoes, setDescricoes] = useState({}); // Estado para armazenar descrições dos eventos

    const inDevelopment = localStorage.getItem('inDevelopment');

    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    
    const verificarAutenticacao = () => {
        if (!isAuthenticated()) {
            console.log('Usuário não autenticado');
            navigate('/Login');
        }
    };

    async function fetchIngressos() {
        try {
            const response = await fetch(url + `Ingresso/Usuario/${localStorage.getItem('id')}`);
            const data = await response.json();
            setIngressos(data);
            setFilteredIngressos(data);
        } catch (error) {
            console.error('Erro ao buscar ingressos:', error);
        }
    }

    useEffect(() => {
        verificarAutenticacao();
        fetchIngressos();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filtroDescricao, filtroStatus, ingressos, descricoes]);

    const applyFilters = () => {
        let filtered = ingressos;

        if (filtroDescricao) {
            filtered = filtered.filter((ingresso) =>
                descricoes[ingresso.idIngresso]?.toLowerCase().includes(filtroDescricao.toLowerCase())
            );
        }

        if (filtroStatus) {
            filtered = filtered.filter((ingresso) => ingresso.status === filtroStatus);
        }

        setFilteredIngressos(filtered);
    };

    const handleStatusFilter = (status) => {
        setFiltroStatus(status === filtroStatus ? null : status); // Toggle the status filter
    };

    const atualizarDescricoes = (id, descricao) => {
        setDescricoes(prevState => ({
            ...prevState,
            [id]: descricao
        }));
    };

    return (
        <>
            <Cabecalho />
            <div className='container'>
                <h3 className='mt-5'>Ingressos</h3>
                <div className="mb-3">
                    <CampoFiltro placeholder="Pesquisar ingressos por evento" handleFilter={setFiltroDescricao} />
                </div>
                <div className="mb-3 d-flex justify-content-start flex-wrap" style={{ gap: '20px' }}>
                    <button className={`btn btn-outline-primary ${filtroStatus === 'Pendente' ? 'active' : ''}`} onClick={() => handleStatusFilter('Pendente')}>Pendente</button>
                    <button className={`btn btn-outline-primary ${filtroStatus === 'Utilizado' ? 'active' : ''}`} onClick={() => handleStatusFilter('Utilizado')}>Utilizado</button>
                    <button className={`btn btn-outline-primary ${filtroStatus === 'Validado' ? 'active' : ''}`} onClick={() => handleStatusFilter('Validado')}>Validado</button>
                    <button className="btn btn-outline-danger" onClick={() => {
                        setFiltroDescricao("");
                        setFiltroStatus(null);
                    }}>Limpar filtros</button>
                </div>

                {filteredIngressos.length === 0 ? (
                    <p className='text-warning'>Nenhum ingresso disponível</p>
                ) : (
                    <div className='d-flex flex-wrap justify-content-start'>
                        {filteredIngressos.map((item, index) => (
                            <div className='col' key={index}>
                                <Ingresso obj={item} key={index} onUpdateDescricao={atualizarDescricoes} descricao={descricoes[item.idIngresso]} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Rodape />
        </>
    );
}

export default MeusIngressos;
