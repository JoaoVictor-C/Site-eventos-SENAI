import propTypes from 'prop-types';

export function TabelaFiltro({ renderizarDados, tableFields, filteredData }) {
    return (
        <div className='container'>
            <div className="table-responsive">
                <table className="table table-striped text-center mt-4">
                    <thead className="thead-dark">
                        <tr>
                            {tableFields.map((field, index) => (
                                <th key={index}>{field}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={tableFields.length}>Nenhum dado encontrado</td>
                            </tr>
                        ) : (
                            renderizarDados()
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

TabelaFiltro.propTypes = {
    renderizarDados: propTypes.func.isRequired,
    tableFields: propTypes.array.isRequired,
};

