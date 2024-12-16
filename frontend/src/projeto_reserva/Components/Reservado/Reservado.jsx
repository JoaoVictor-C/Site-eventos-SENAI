import Cabecalho from '../Cabecalho/Cabecalho'
import Rodape from '../Rodape/Rodape'
import './Reservado.css'

const Reservado = () => (
    <div>
        <Cabecalho />
        <div className='all'>
            <div className='arraia'>
                <h1>Arraiá do Senai</h1>
                <h3>24/05/2024 - 19:00 até 00:00</h3>
                <h3>Escola SENAI - Lençóis Paulista</h3>
            </div>
            <div className='all'>
                <div className='seus_ingressos'>
                    <h1 className='validacao'>Seus ingressos já estão reservados</h1>
                </div>
                <div className='div_buy'>
                    <h2 className='buy'>R$ 15,00</h2>
                </div>
                    <div className='ingressos'>
                        <div className='parti'>
                            <h3 className='adulto'>Ingresso Adulto - Lote 1</h3>
                            <p>R$ 10,00</p>
                            <p>Vendas até 24/05/2024</p>
                            <h3 className='numero_ingressos'>Quantidade 1</h3>
                            <hr />
                        </div>
                        <div className='parti'>
                            <h3 className='infantil'>Ingreso Infantil - Lote 1</h3>
                            <p>R$ 5,00</p>
                            <p>Vendas até 24/05/2024</p>
                            <h3 className='numero_ingressos'>Quantidade: 1</h3>
                        </div>
                    </div>
                <div className='validar'>
                    <h1 className='validacao'>Você tem --:-- para validar seu ingresso(s)</h1>
                </div>
                    <div className='lista'>
                        <h2 className='valido'>Como validar seus ingressos?</h2>
                        <ul>
                            <li>
                                <p>Você deve vir ao SENAI e falar com um administrador;</p>
                            </li>
                            <li>
                                <p>Você pode pagar no pix ou dinheiro;</p>
                            </li>
                            <li>
                                <p>Fique atento ao tempo para validar seu ingresso;</p>
                            </li>
                            <li>
                                <p>Caso o tempo se esgote e você não tenha pago, você terá que reservar nomamente;</p>
                            </li>
                            <li>
                                <p>Assim que estiver validado espere o dia do evento e se divirta;</p>
                            </li> 
                        </ul>
                    </div>
            </div>
        </div>
        <Rodape />
    </div>
)

export default Reservado