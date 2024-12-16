import React, { useState } from 'react';
import Menu from '../../components/Menu/';
import Rodape from '../../components/Rodape/';
import Categorias from '../../components/Categorias/Categorias';
import GraficoLote from '../../components/Grafico/GraficoLote';
import GraficoIngresso from '../../components/Grafico/GraficoIngresso';
import { useParams } from 'react-router-dom';

const GraficosPage = () => {
    const [tipoGrafico, setTipoGrafico] = useState('lote');
    const idEvento = useParams().idEvento;
    const handleButtonClick = (tipo) => {
        setTipoGrafico(tipo);
    };

    return(
        <div>
            <Menu />
            <div className={'graficos-page'}>
                <Categorias onButtonClick={handleButtonClick} /> 
                {tipoGrafico === 'lote' ? <GraficoLote /> : <GraficoIngresso />}
            </div>
            <Rodape />

        </div>
    );
}

export default GraficosPage;
