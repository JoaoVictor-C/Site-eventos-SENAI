import { Link } from 'react-router-dom'
import './Menu.css'

function Menu() {
    return (
        <div className='menu'>
            <nav>
                <ul>
                    <li>
                        <Link to='/'></Link>
                    </li>
                        <Link to='/validacao'>Validação</Link>
                    <li>
                        <Link to='/confirmacao'>Confirmação</Link>
                    </li>
                    <li>
                        <Link to='/invalido'>Invalido</Link>
                    </li>

                    <li>
                        <Link to='/camera'>Câmera</Link>
                    </li>
                    <li>
                        <Link to='/TenteNovamente'>Tente Novamente</Link>
                    </li>
                    <li>
                        <Link to='/qrpage'>Qr Câmera</Link>
                    </li>
                </ul>
            </nav>

        </div>
    )
}

export default Menu