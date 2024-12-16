import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useParams } from "react-router-dom";
import constantes from "../../../componentes/Constantes.jsx";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Grafico = () => {
    const idEvento = useParams().idEvento;
    const [lotes, setLotes] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const inDevelopment = localStorage.getItem('inDevelopment');
	var url = '';
    if (inDevelopment === 'true') {
        url = constantes.localApiUrl;
    } else {
        url = constantes.apiUrl;
    }

    useEffect(() => {
        fetchLotes();
    }, []);

    const fetchLotes = async () => {
        try {
            //const response = await fetch(url + 'Ingresso/quantidadeByTipoByEvento/' + idEvento);
            //const data = await response.json();
            const response = await fetch(`${url}Lote/evento/${idEvento}`);
            const data = await response.json();
            console.log(data)

            setLotes(data);
        } catch (error) {
            console.error('Erro ao buscar lotes:', error);
        }
    }

    const handleLoteChange = (event) => {
        const selectedIdLote = parseInt(event.target.value);
        const selected = lotes.find(lote => lote.idLote === selectedIdLote);
        selected.vendas = selected.quantidadeTotal - selected.saldo;
        selected.profit = selected.vendas * selected.valorUnitario;
        setSelectedLote(selected);
    }

    return (
        <div className="container">
            <div className="mb-3">
                <label htmlFor="lotes" className="form-label">Escolha um lote:</label>
                <select className="form-select" onChange={handleLoteChange}>
                    <option value="">Selecione um lote</option>
                    {lotes.map(lote => (
                        <option key={lote.idLote} value={lote.idLote}>
                            {`${lote.nome}`}
                        </option>
                    ))}
                </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={selectedLote ? [
                            { name: 'Vendidos', value: selectedLote.vendas },
                            { name: 'Disponíveis', value: selectedLote.saldo },
                        ] : []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={160}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {selectedLote && COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        align="left"
                        verticalAlign="top"
                        layout="vertical"
                        fontSize={14}
                        iconSize={14}
                        iconType="circle"
                        wrapperStyle={{ lineHeight: '30px', marginLeft: '20px', marginTop: '25px', fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            {selectedLote && (
                <div className="mt-3">
                    <p>{`Vendas: ${selectedLote.vendas}`}</p>
                    <p>{`Ingressos disponíveis: ${selectedLote.saldo}`}</p>
                    <p>{`Quantidade total de ingressos: ${selectedLote.quantidadeTotal}`}</p>
                </div>
            )}
        </div>
    );
};

export default Grafico;
