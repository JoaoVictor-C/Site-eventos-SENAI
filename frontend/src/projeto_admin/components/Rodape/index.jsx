import 'bootstrap/dist/css/bootstrap.min.css';
import senaiRodape from '../../../assets/Images/senaiRodape.png';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer-container text-white py-5 mt-5 px-5" style={{ backgroundColor: "#4C576C" }}>
      <div className="container">
        <div className="row align-items-start">
          <div className="col-12 col-md-4 w-100">
            <img className="img-fluid senai" src={senaiRodape} alt="Logo" />
            <hr className="bg-white" />
            <div className="col-12 col-md-8">
            <div className="d-flex flex-column flex-md-row align-items-center mt-3">
              <Link to="/admin" className="btn btn-link fs-5" style={{color: '#fff', textDecoration: 'none'}}>Home</Link>
              <Link to="/admin/pedidos" className="text-white btn btn-link fs-5" style={{ textDecoration: 'none'}}>Pedidos</Link>
              <Link to="/admin/usuarios" className="text-white btn btn-link fs-5" style={{ textDecoration: 'none'}}>Usuários</Link>
              <Link to="/admin/criar_evento" className="text-white btn btn-link fs-5" style={{ textDecoration: 'none'}}>Criar Evento</Link>
              <Link to="/admin/editar_evento" className="text-white btn btn-link fs-5" style={{ textDecoration: 'none'}}>Editar Evento</Link>
            </div>
          </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
