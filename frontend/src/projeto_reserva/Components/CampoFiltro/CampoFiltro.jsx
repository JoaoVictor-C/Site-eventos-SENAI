import './CampoFiltro.css'

import React from 'react'

function CampoFiltro(props) {
    return (
        <>
            <div className="input-group mb-3">
                <span className="input-group-text" id="box-icon"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" id="input-filtro" placeholder={props.placeholder}  onChange={(e) => props.handleFilter(e.target.value)}/>
            </div>
        </>
    );
}

export default CampoFiltro;
