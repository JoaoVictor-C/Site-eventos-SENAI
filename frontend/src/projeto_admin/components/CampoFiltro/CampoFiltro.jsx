import propTypes from 'prop-types';

export function CampoFiltro(props) {
    return (
        <>
            <div className="input-group mb-3" style={{ maxWidth: "500px", width: "100%", marginRight: "10px" }}>
                <span className="input-group-text border rounded-start" id="box-icon"><i className="bi bi-search" style={{ fontSize: "12pt" }}></i></span>
                <input type="text" className="form-control border rounded-end" placeholder={props.placeholder} onChange={(e) => props.handleFilter(e.target.value)} />
            </div>
        </>
    );
}

CampoFiltro.propTypes = {
    placeholder: propTypes.string.isRequired,
    handleFilter: propTypes.func.isRequired,
};

