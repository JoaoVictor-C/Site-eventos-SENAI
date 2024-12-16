
import 'bootstrap/dist/css/bootstrap.min.css';
import senaiRodape from '../../../assets/Images/senaiRodape.png';
import { Link } from 'react-router-dom';

function Rodape() {
    return (
        <footer className="footer-container text-white py-5 mt-5" style={{ backgroundColor: "#4C576C" }}>
            <div className="container">
                <div className="align-items-">
                    <div className="col-12">
                        
                        <img className="img-fluid senai" src={senaiRodape} alt="Logo" />

                        <hr className="bg-white" />
                        
                        <div className="col-12">
                            <div className="d-flex flex-column flex-md-row align-items-center mt-3">
                                <Link Link to="/" className="btn-link btn text-white fs-5" style={{ textDecoration: 'none' }}>Eventos</Link>
                                <Link to="/meusIngressos" className="btn-link btn text-white fs-5" style={{ textDecoration: 'none' }}>Meus ingressos</Link>
                                <Link to="/suporte" className="btn-link btn text-white fs-5" style={{ textDecoration: 'none' }}>Fale conosco</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}

export default Rodape;
