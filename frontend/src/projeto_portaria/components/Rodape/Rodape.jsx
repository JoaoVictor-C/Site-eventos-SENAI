import './Rodape.css'
import { Link } from 'react-router-dom'
import imgBanner from '../../../assets/Images/banner_logo.png'

import './Rodape.css'

const Rodape = () => {
    return (
      <footer className="footer py-5 mt-auto" style={{ backgroundColor: "#4C576C" }}>
        <div className="container-fluid">
          <div className="row" style={{justifyContent: 'start'}}>
            <div className="col-md-8" style={{textAlign: 'start'}}>
              <img src={imgBanner} alt="Logo" className="" style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            <hr style={{border: '2px solid #fff'}} className='m-0 mt-4'></hr>
            <div className="col-md-7">
              <ul className="list-unstyled d-flex">
                <li className="footer-link me-3 mt-4 ml-5">
                  <Link to="/suporte" className="btn-link btn">Fale conosco</Link>
                </li>
                <li className="footer-link mt-4 ml-5">
                  <Link to="/" className="btn-link btn">Home</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Rodape;
