import { Lote } from '../../components/Lote/Lote.jsx';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notifyError, notifySuccess } from '../../components/Utils/msgToast.jsx';
import Rodape from "../../components/Rodape/index.jsx";
import Menu from "../../components/Menu/index.jsx";
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../components/Utils/auth.jsx';
import { Modal, Button } from 'react-bootstrap'
import constantes from "../../../componentes/Constantes.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const CriarEvento = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const inDevelopment = localStorage.getItem('inDevelopment');
    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }
    const navigate = useNavigate();

    const verificarAutenticacao = () => {
        if (!isAuthenticated()) {
            console.log('Usuário não autenticado');
            navigate('/admin/');
        }
    }

    useEffect(() => {
        verificarAutenticacao();
    }, []);

    const criarLotes = (lotes, idEvento) => {
        lotes.forEach(lote => {
            const loteData = {
                idLote: 0,
                eventoId: idEvento,
                valorUnitario: lote.preco ? lote.preco : 0,
                quantidadeTotal: lote.quantidadeIngressos,
                saldo: lote.quantidadeIngressos,
                dataFinal: lote.dataTermino ? lote.dataTermino : null,
                dataInicio: lote.dataInicio ? lote.dataInicio : null,
                tipo: lote.tipoLote,
                nome: lote.nomeLote,
                ativo: lote.ativo,
            };

            fetch(url + 'lote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loteData),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                setSuccessMessage('Evento criado com sucesso!');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    }

    function handleSubmit() {
        const lotes = [];
        for (let i = 0; i < formData.get("quantidadeLotes"); i++) {
            const tipoLote = formData.get('tipoLote');
            let preco = formData.getAll('valorIngresso')[i];
            const quantidadeIngressos = formData.getAll('quantidadeIngressos')[i];
            const dataInicio = formData.getAll('dataInicio')[i];
            const dataTermino = formData.getAll('dataTermino')[i];
            const nomeLote = formData.getAll('nomeLote')[i];
            const ativo = i === 0 ? 1 : 0;
            
            preco = preco.replace(',', '.');

            if (tipoLote === 'quantidade' && (quantidadeIngressos === '' || preco === '')) {
                setErrorMessage('Por favor preencha todos os campos dos lotes.');
                window.scrollTo(0, document.body.scrollHeight);
                return;
            } else {
                lotes.push({
                    tipoLote,
                    preco,
                    quantidadeIngressos,
                    dataInicio,
                    dataTermino,
                    nomeLote,
                    ativo,
                });
            }
        }

        if (lotes.length === 0) {
            setErrorMessage('Por favor adicione ao menos um lote.');
            return;
        } else {
            setErrorMessage('');
        }

        const formularioData = new FormData(document.getElementById('form'));
        

        fetch(url + 'evento', {
            method: 'POST',
            body: formularioData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            if (lotes.length !== 0) {
                criarLotes(lotes, data.idEvento);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    const [lotes, setLotes] = useState([]);
    const [tipoLote, setTipoLote] = useState('quantidade');
    const [quantidadeLotes, setQuantidadeLotes] = useState(1);

    const handleAddLotes = (event) => {
        event.preventDefault();
        const newLotes = Array.from({ length: quantidadeLotes }, () => ({ tipo: tipoLote }));
        setLotes(newLotes);
        toast.info('Lote adicionado com sucesso!');
    };

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }

    }, [errorMessage]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setSuccessMessage('');
            setTimeout(() => {
                navigate('/admin/editar_evento');
            }, 2000);
        }
    }, [successMessage, navigate]);

    const confirmSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        setFormData(data);
        const file = data.get('imagemDivulgacao');

        if (file && file.size > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview('');
        }
        setShowModal(true);
    }

    const handleConfirm = () => {
        setShowModal(false);
        handleSubmit();
    }

    return (
        <div>
            <Menu/>
            <form onSubmit={confirmSubmit} className="p-4" id="form">
                <h1 className="mb-4">Criar evento</h1>
                <fieldset className="border border-primary rounded p-4 mb-4">
                    <legend className="text-primary fs-3">1. Informações básicas</legend>
                    <p>Adicione as principais informações do evento</p>
                    <div className="mb-3">
                        <label htmlFor="nomeEvento" className="form-label">Nome do evento <strong style={{ color: 'red', fontWeight: 'normal' }}>*</strong></label>
                        <input type="text" className="form-control w-25" placeholder="Nome do evento" required name={"nomeEvento"} />
                    </div>

                    <h3>Imagem de divulgação (opcional)</h3>
                    <div className="mb-3">
                        <input type="file" accept="image/*" className="form-control w-25" name="imagem" />
                        <p>A dimensão recomendada é de 460 (W) x 388 (H). Formato JPEG, GIF ou PNG de no máximo 2MB. Imagens com dimensões diferentes serão redimensionadas.</p>
                    </div>
                </fieldset>

                <fieldset className="border border-primary rounded p-4 mb-4">
                    <legend className="text-primary fs-3">2. Descrição do evento</legend>
                    <p>Adicione informações detalhadas sobre o evento</p>
                    <div className="mb-3">
                        <label htmlFor="descricao" className="form-label">Descrição <strong style={{ color: 'red', fontWeight: 'normal' }}>*</strong></label>
                        <textarea className="form-control" placeholder="Descrição do evento" required name={"descricao"}></textarea>
                    </div>
                </fieldset>

                <fieldset className="border border-primary rounded p-4 mb-4">
                    <legend className="text-primary fs-3">3. Data do evento</legend>
                    <p>Quando o seu evento irá acontecer?</p>
                    <div className="mb-3">
                        <label htmlFor="dataEvento" className="form-label">Data <strong style={{ color: 'red', fontWeight: 'normal' }}>*</strong></label>
                        <input type="date" min={today} required name={"dataEvento"} className={"form-control DataInput w-25"} />
                    </div>
                </fieldset>

                <fieldset className="border border-primary rounded p-4 mb-4">
                    <legend className="text-primary fs-3">4. Criar lote(s)</legend>
                    <p>Adicione ingressos para o seu evento</p>

                    <div className={"mb-3 TipoLote"}>
                        <label htmlFor="tipoLote" className="form-label">Qual tipo de lote o seu evento irá ter?</label>
                        <select value={tipoLote} onChange={(e) => setTipoLote(e.target.value)} required name={"tipoLote"} className="form-select w-25">
                            <option value="quantidade">Quantidade</option>
                            <option value="tempo">Tempo</option>
                            <option value="gratis">Grátis</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="quantidadeLotes" className="form-label">Quantidade de lotes</label>
                        <input type="number" value={quantidadeLotes} min={1} onChange={(e) => setQuantidadeLotes(e.target.value)} required name={"quantidadeLotes"} className={"form-control QuantidadeLote w-25"} />
                    </div>

                    <button onClick={handleAddLotes} className="btn btn-primary AdicionarLote mb-4">Adicionar lote</button>

                    {lotes.map((lote, index) => (
                        <Lote key={index} tipo={lote.tipo} />
                    ))}
                </fieldset>

                <fieldset className="border border-primary rounded p-4 mb-4">
                    <legend className="text-primary fs-3">5. Local do evento</legend>
                    <p>Onde o seu evento irá acontecer?</p>
                    <div className="mb-3">
                        <label htmlFor="local" className="form-label">Local <strong style={{ color: 'red', fontWeight: 'normal' }}>*</strong></label>
                        <input type="text" className="form-control w-50" placeholder="Local do evento" name={"local"} required />
                    </div>
                </fieldset>
                
                <input type="hidden" name="ativo" value="1" />
                <input type="hidden" name="totalIngressos" value="0" />
                <input type="hidden" name="imagemUrl" value="" />
                <input type="hidden" name="idEvento" value="0" />
                <button type="submit" className={"btn btn-primary me-2"}>Criar evento</button>
                <ToastContainer />
            </form>
            <Rodape/>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmação de Submissão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza de que deseja criar este evento?</p>
                    <ul className="list-group">
                        <li className="list-group-item"><strong>Nome do evento:</strong> {formData?.get('nomeEvento')}</li>
                        <li className="list-group-item"><strong>Descrição:</strong> {formData?.get('descricao')}</li>
                        <li className="list-group-item"><strong>Data do evento:</strong> {formData?.get('dataEvento')}</li>
                        <li className="list-group-item"><strong>Local:</strong> {formData?.get('local')}</li>
                        <li className="list-group-item">
                            <strong>Lotes:</strong>
                            {lotes.map((lote, index) => (
                                <div key={index} className="mb-2">
                                    <strong>Nome do lote:</strong> {formData?.getAll('nomeLote')[index]}
                                    <ul className="list-group mt-2">
                                        <li className="list-group-item"><strong>Tipo:</strong> {lote.tipo}</li>
                                        <li className="list-group-item"><strong>Preço:</strong> {formData?.getAll('valorIngresso')[index]}</li>
                                        <li className="list-group-item"><strong>Quantidade de ingressos:</strong> {formData?.getAll('quantidadeIngressos')[index]}</li>
                                        <li className="list-group-item"><strong>Data de início:</strong> {formData?.getAll('dataInicio')[index]}</li>
                                        <li className="list-group-item"><strong>Data de término:</strong> {formData?.getAll('dataTermino')[index]}</li>
                                    </ul>
                                </div>
                            ))}
                        </li>
                    </ul>
                    {imagePreview && (
                        <div className="text-center mt-3 mb-3 d-flex flex-column align-items-center" style={{gap: '1rem'}}>
                            <strong>Imagem de divulgação:</strong>
                            <img src={imagePreview} alt="Imagem de Divulgação" className="img-fluid rounded shadow" style={{ maxHeight: '300px' }} />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default CriarEvento;
