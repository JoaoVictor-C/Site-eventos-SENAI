import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useParams } from "react-router-dom";
import constantes from "../../../componentes/Constantes.jsx";

const COLORS = ['#2F5F98', '#2D8BBA', '#41B8D5', '#6CE5E8', '#FFBB28', '#FF8042'];
const COLORS2 = ['#2F5F98', '#2D8BBA', '#41B8D5', '#6CE5E8', '#FFBB28', '#FF8042'];

const Grafico = () => {
    const { idEvento } = useParams();
    const [quantidadeIngressos, setQuantidadeIngressos] = useState([]);
    const [ingressos, setIngressos] = useState({});
    const [allIngressos, setAllIngressos] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const inDevelopment = localStorage.getItem('inDevelopment');
    const [selected, setSelected] = useState(false);
    var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }

    async function fetchQuantidadeIngressos() {
        try {
            const response = await fetch(url + 'Ingresso/quantidadeByTipoByEvento/' + idEvento);
            const data = await response.json();
            const dataArray = Object.entries(data.quantidadePorTipo).map(([name, value]) => ({ name, value }));
            const dataArrayIngressos = data.ingressos.map(ingresso => ({
                idIngresso: ingresso.idIngresso,
                pedidosId: ingresso.pedidosId,
                pedidosUsuariosId: ingresso.pedidosUsuariosId,
                loteId: ingresso.loteId,
                status: ingresso.status,
                tipo: ingresso.tipo,
                valor: ingresso.valor,
                dataUtilizacao: ingresso.dataUtilizacao,
                codigoQr: ingresso.codigoQr,
                ativo: ingresso.ativo
            }));

            console.log(dataArrayIngressos)

            //Mostra os pendentes
            console.log(dataArrayIngressos.filter(ingresso => ingresso.status === 'Utilizado'));

            const tipoIngressosData = {
                Colaborador: {
                    quantidade: dataArray.find(item => item.name === 'Colaborador')?.value || 0,
                    valor: dataArrayIngressos.find(ingresso => ingresso.tipo === 'Colaborador')?.valor || 0,
                    pendentes: dataArrayIngressos.filter(ingresso => ingresso.tipo === 'Colaborador' && ingresso.status === 'Pendente').length
                },
                Aluno: {
                    quantidade: dataArray.find(item => item.name === 'Aluno')?.value || 0,
                    valor: dataArrayIngressos.find(ingresso => ingresso.tipo === 'Aluno')?.valor || 0,
                    pendentes: dataArrayIngressos.filter(ingresso => ingresso.tipo === 'Aluno' && ingresso.status === 'Pendente').length
                },
                Comunidade: {
                    quantidade: dataArray.find(item => item.name === 'Comunidade')?.value || 0,
                    valor: dataArrayIngressos.find(ingresso => ingresso.tipo === 'Comunidade')?.valor || 0,
                    pendentes: dataArrayIngressos.filter(ingresso => ingresso.tipo === 'Comunidade' && ingresso.status === 'Pendente').length
                },
                Infantil: {
                    quantidade: dataArray.find(item => item.name === 'Infantil')?.value || 0,
                    valor: dataArrayIngressos.find(ingresso => ingresso.tipo === 'Infantil')?.valor || 0,
                    pendentes: dataArrayIngressos.filter(ingresso => ingresso.tipo === 'Infantil' && ingresso.status === 'Pendente').length
                }
            };

            setAllIngressos(dataArrayIngressos);
            setIngressos(tipoIngressosData);
            setQuantidadeIngressos(dataArray);
            handlePieClick(dataArray[0], 0);
        } catch (error) {
            console.error('Erro ao buscar quantidade de ingressos por tipo:', error);
        }
    }

    const handlePieClick = (data, index) => {
        const selectedIngresso = quantidadeIngressos[index];
        let selectedLote = ingressos[selectedIngresso.name];
        selectedLote.value = selectedIngresso.value;
        selectedLote.name = selectedIngresso.name;
        setSelectedLote(selectedLote);
    };

    useEffect(() => {
        fetchQuantidadeIngressos();
    }, []);

    return (
        <div>
            <h2 className="text-center mt-4 mb-4">Quantidade de Ingressos por Tipo</h2>
            <div className="d-flex justify-content-center gap-3 align-items-center mb-4">
                <label htmlFor={"pendentes"}>Mostrar apenas ingressos pendentes</label>
                <input type={"checkbox"} id={"pendentes"} name={"pendentes"} value={"pendentes"} style={{ width: '20px', height: '20px' }} checked={selected} onChange={() =>
                    {setSelected(!selected)}} />
            </div>
            <ResponsiveContainer width="100%" height={500} className="d-flex justify-content-center align-items-center">
                <PieChart>
                    <Pie
                        data={
                            selected ?
                                // Irá mostrar os ingressos normais porém agora irá deduzir da quantidade de ingressos totais os ingressos pendentes e irá adicionar uma célula somente para todos os pendentes
                                quantidadeIngressos.map((ingresso, index) => {
                                    return {
                                        name: ingresso.name,
                                        value: ingressos[ingresso.name].quantidade - ingressos[ingresso.name].pendentes,
                                    }
                                })
                                .concat({
                                    name: 'Pendentes',
                                    value: allIngressos.filter(ingresso => ingresso.status === 'Pendente').length
                                })
                                :
                                quantidadeIngressos
                        }
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={document.body.clientWidth >= 960 ? 200 : 110}
                        fontSize={document.body.clientWidth < 960 ? '12' : ''}
                        fill="#8884d8"
                        dataKey={"value"}
                        onClick={handlePieClick}
                    >
                        {quantidadeIngressos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                        {selected ? <Cell key={`cell-${quantidadeIngressos.length}`} fill={COLORS2[4]}/> : null}
                    </Pie>
                    <Tooltip />
                    <Legend
                        align="center"
                        verticalAlign="bottom"
                        layout="horizontal"
                        iconSize={18}
                        formatter={(value, entry, index) => {
                            if (selected) {
                                if (selected && index === quantidadeIngressos.length) {
                                    return `Pendentes: ${quantidadeIngressos.reduce((acc, ingresso) => acc + ingressos[ingresso.name].pendentes, 0)}`
                                }
                                return `${entry.payload.name}: ${quantidadeIngressos[index].value - ingressos[entry.payload.name].pendentes}`
                            } else {
                                return `${entry.payload.name}: ${quantidadeIngressos[index].value}`
                            }
                        }}
                        tooltipType="none"
                        iconType="circle"
                        wrapperStyle={{ lineHeight: '30px', marginLeft: '20px', marginTop: '25px', fontSize: '18px', paddingLeft: '20px'}}
                        chartWidth={100}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 d-flex justify-content-center gap-5 flex-wrap p-3">
            {selectedLote && (
                <div className="">
                    <h3 className='fs-4'>Detalhes do Tipo de ingresso Selecionado</h3>
                    <p className="fs-5"><strong>Tipo:</strong> {selectedLote.name}</p>
                    <p className="fs-5"><strong>Quantidade:</strong> {selected ? selectedLote.value - selectedLote.pendentes : selectedLote.value}</p>
                    <p className="fs-5"><strong>Receita:</strong> R$ {selected ? (selectedLote.value - selectedLote.pendentes) * selectedLote.valor : selectedLote.value * selectedLote.valor}</p>
                </div>
            )}

            {/* Informações de todos os selecionados */}
            <div className=''>
                <h3 className='fs-4'>Informações de todos os tipos ingressos</h3>
                <p className="fs-5"><strong>Total ingressos comprados:</strong> {allIngressos.length}</p>
                <p className="fs-5"><strong>Receita total:</strong> R$ {
                    selected ?
                        quantidadeIngressos.reduce((acc, ingresso) => acc + (ingressos[ingresso.name].quantidade - ingressos[ingresso.name].pendentes) * ingressos[ingresso.name].valor, 0)
                        :
                        quantidadeIngressos.reduce((acc, ingresso) => acc + ingressos[ingresso.name].quantidade * ingressos[ingresso.name].valor, 0)
                }</p>
                <p className="fs-5"><strong>Quantidade por tipo:</strong></p>
                <ul>
                    {quantidadeIngressos.map((ingresso, index) => (
                        <li className="fs-5" key={index}>{ingresso.name}: {} {selected ? ingressos[ingresso.name].quantidade - ingressos[ingresso.name].pendentes : ingressos[ingresso.name].quantidade}</li>
                    ))}
                </ul>

                <p className='fs-5'><strong>Receita por tipo:</strong></p>
                <ul>
                    {quantidadeIngressos.map((ingresso, index) => (
                        <li className="fs-5" key={index}>{ingresso.name}: R$ {selected ? (ingressos[ingresso.name].quantidade - ingressos[ingresso.name].pendentes) * ingressos[ingresso.name].valor : ingressos[ingresso.name].quantidade * ingressos[ingresso.name].valor}</li>
                    ))}
                </ul>
            </div>
            </div>
            
        </div>
    );
};

export default Grafico;
