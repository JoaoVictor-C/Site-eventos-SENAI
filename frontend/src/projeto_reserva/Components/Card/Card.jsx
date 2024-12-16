import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import defaultImage from '../../../assets/Images/arraia.png';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatarData(data) {
    const dataCompleta = parseISO(data);
    return format(dataCompleta, 'dd/MM/yyyy', { locale: ptBR });
}

function Card({ dados }) {
    return (
        <Link to={`./InicioReserva/${dados.idEvento}`} className="text-decoration-none" style={{ color: 'black' }}>
            <div className='card p-4 m-2'>
                {console.log(dados.imagem)}
                <img src={dados.imagem || defaultImage} alt="Imagem do evento" className='card-img-top' />
                <div className='card-body'>
                    <p className='card-text fs-5'>{formatarData(dados.dataEvento)}</p>
                    <p className='card-title fs-5'><h4>{dados.nomeEvento}</h4></p>
                    <p className='card-text fs-5'>{dados.local}</p>
                </div>
            </div>

        </Link>
    );
}

Card.propTypes = {
    dados: PropTypes.shape({
        idEvento: PropTypes.number.isRequired,
        nomeEvento: PropTypes.string.isRequired,
        dataEvento: PropTypes.string.isRequired,
        local: PropTypes.string.isRequired,
        imagem: PropTypes.string, // Optional
    }).isRequired,
};

export default Card;
