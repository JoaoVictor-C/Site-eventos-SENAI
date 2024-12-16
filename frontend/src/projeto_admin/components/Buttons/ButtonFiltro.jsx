import PropTypes from 'prop-types';

export function ButtonFiltro(props) {
    const handleChange = (event) => {
        props.handleFilter(event.target.value);
        document.getElementById(`btn-${props.opcoes[0]}`).style.display = "block";
    };

    const handleClick = () => {
        props.handleClear(props.type);
        document.getElementById(`btn-${props.opcoes[0]}`).style.display = "none";
        document.getElementById(`select-${props.opcoes[0]}`).selectedIndex = 0;
    }

    return (
        <div className="input-group w-100 mb-3" style={{maxWidth: "500px"}}>
            <span className="input-group-text border" style={{border: "1px solid rgba(0,0,0,0.50)"}}><i className="bi bi-funnel-fill"></i></span>
            <select className="form-select border btn-filtro-select rounded-end"
             onChange={handleChange} id={`select-${props.opcoes[0]}`}>
                <option defaultValue value="" style={{display: "none"}}>Filtrar por...</option>
                {props.opcoes.map(opcao => (
                    <option key={opcao}>{opcao}</option>
                ))}
            </select>
            <button className="btn btn-primary border rounded-end" id={`btn-${props.opcoes[0]}`} onClick={handleClick} style={{display: "none"}}>Limpar</button>
        </div>
    );
}

ButtonFiltro.propTypes = {
    handleFilter: PropTypes.func.isRequired,
    handleClear: PropTypes.func.isRequired,
    opcoes: PropTypes.array.isRequired,
}
