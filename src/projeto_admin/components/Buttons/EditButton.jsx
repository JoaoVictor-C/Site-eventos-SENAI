import PropTypes from 'prop-types';

export const EditButton = ({data, setModalData}) => {
    function changeModalData() {
        //console.log(data);
        setModalData(data);
    }

    return (
        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal" onClick={changeModalData}>
            Editar
        </button>
    )
}

EditButton.propTypes = {
    data: PropTypes.object.isRequired,
    setModalData: PropTypes.func.isRequired,
};