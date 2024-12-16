import './ModalConteudo.css'
function ModalConteudo({ texto, closeModal }) {
    return (
        <>
            <div className='modal-topo'>
                <button className='botao-modal' onClick={closeModal}><h2>X</h2></button>
            </div>

            <div className='modal-conteudo' >
                <p className="texto-modal">{texto}</p>
                
            </div>
        </>
    )
}

export default ModalConteudo