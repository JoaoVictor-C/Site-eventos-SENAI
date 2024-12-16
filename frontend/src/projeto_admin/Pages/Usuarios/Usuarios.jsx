import { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import { CampoFiltro } from "../../components/CampoFiltro/CampoFiltro.jsx";
import { ButtonFiltro } from "../../components/Buttons/ButtonFiltro.jsx";
import { TabelaFiltro } from "../../components/TabelaFiltro/TabelaFiltro.jsx";
import { ModalUsuarios } from "../../components/Modal/ModalUsuarios.jsx";
import { EditButton } from "../../components/Buttons/EditButton.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Rodape from "../../components/Rodape/index.jsx";
import Menu from "../../components/Menu/index.jsx";
import constantes from "../../../componentes/Constantes.jsx";

function Usuarios() {
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [filters, setFilters] = useState({
        ativo: null,
        perfil: null,
    });
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    const [modalData, setModalData] = useState();
    const [showPassword, setShowPassword] = useState({});

    const inDevelopment = localStorage.getItem('inDevelopment');
    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }

    useEffect(() => {
        async function fetchUsuarios() {
            const response = await fetch(url + 'Usuario');
            const data = await response.json();
            setUsuarios(data);
            setFilteredUsuarios(data);
        }

        fetchUsuarios();
    }, []);

    useEffect(() => {
        if (modalData) {
            document.getElementById('nomeCompleto').value = modalData.nomeCompleto;
            document.getElementById('email').value = modalData.email;
            document.getElementById('senha').value = modalData.senha;
            document.getElementById('telefone').value = modalData.telefone;
            document.getElementById('perfil').value = modalData.perfil;
            document.getElementById('ativo').checked = modalData.ativo;
            document.getElementById('idUsuario').value = modalData.idUsuario;
        }
    }, [modalData]);

    const handleFilter = (type, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [type]: prevFilters[type] === value ? null : value,
        }));
    };

    const applyFilters = (data) => {
        return data.filter((item) => {
            const matchesText = filterText === "" || item.nomeCompleto.toLowerCase().includes(filterText.toLowerCase());
            const matchesAtivo = filters.ativo === null || (filters.ativo === "Ativo" ? item.ativo : !item.ativo);
            const matchesPerfil = filters.perfil === null || item.perfil === filters.perfil;
            return matchesText && matchesAtivo && matchesPerfil;
        });
    };

    const handleClear = (type) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [type]: null,
        }));
    };

    useEffect(() => {
        setFilteredUsuarios(applyFilters(usuarios));
    }, [filterText, filters, usuarios]);

    const togglePasswordVisibility = (idUsuario) => {
        setShowPassword((prevShowPassword) => ({
            ...prevShowPassword,
            [idUsuario]: !prevShowPassword[idUsuario]
        }));
    };

    const renderizarDados = () => {
        return filteredUsuarios.map((item) => (
            <tr key={item.idUsuario}>
                <td>{item.nomeCompleto}</td>
                <td>{item.email}</td>
                {/* <td onMouseEnter={() => togglePasswordVisibility(item.idUsuario)} onMouseLeave={() => setShowPassword((prevShowPassword) => ({ ...prevShowPassword, [item.idUsuario]: false }))} onClick={() => togglePasswordVisibility(item.idUsuario)}>
                    {showPassword[item.idUsuario] ? item.senha : '●●●●●●●●'}
                </td> */}                
                <td>{item.telefone}</td>
                <td>{item.perfil}</td>
                <td>{item.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <EditButton data={item} modalData={modalData} setModalData={setModalData} />
                </td>
            </tr>
        ));
    };

    const tableFields = ["Nome Completo", "Email", "Telefone", "Perfil", "Ativo", ""];

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
        if (successMessage) {
            toast.success(successMessage);
        }
    }, [errorMessage, successMessage]);

    return (
        <div>
            <Menu />
            <div className="container">
                <h3 className="text-center">Usuários cadastrados</h3>
                <div className="row justify-content-center">
                    <div className="col">   
                        <CampoFiltro placeholder="Pesquisar usuário por nome" handleFilter={setFilterText} />
                        <div className="btn-group w-100" role="group" aria-label="Basic checkbox toggle button group">
                            <ButtonFiltro opcoes={["Ativo", "Inativo"]} handleClear={handleClear} handleFilter={(value) => handleFilter("ativo", value)} type="ativo" />
                        </div>
                        <div className="btn-group w-100" role="group" aria-label="Basic checkbox toggle button group">
                            <ButtonFiltro opcoes={["Usuario", "Administrador", "Portaria"]} handleClear={handleClear} handleFilter={(value) => handleFilter("perfil", value)} type="perfil" />
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-12">
                        <TabelaFiltro renderizarDados={renderizarDados} tableFields={tableFields} filteredData={filteredUsuarios} />
                    </div>
                </div>
                <ModalUsuarios modalData={modalData} setModalData={setModalData} usuarios={usuarios} setUsuarios={setUsuarios} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
            </div>
            <Rodape />
            <ToastContainer />
        </div>
    );
}

export default Usuarios;
