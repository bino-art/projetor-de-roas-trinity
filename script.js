document.addEventListener('DOMContentLoaded', () => {
    const ticketMedioInput = document.getElementById('ticketMedio');
    const investimentoAnunciosInput = document.getElementById('investimentoAnuncios');
    const roasDesejadoInput = document.getElementById('roasDesejado');
    const cpmInput = document.getElementById('cpm');
    const ctrInput = document.getElementById('ctr');
    const connectRateInput = document.getElementById('connectRate');
    const taxaLpCheckoutInput = document.getElementById('taxaLpCheckout');
    const taxaCheckoutInput = document.getElementById('taxaCheckout');
    
    const impressoesSpan = document.getElementById('impressoes');
    const cliquesSpan = document.getElementById('cliques');
    const cpcSpan = document.getElementById('cpc');
    const visitasLpSpan = document.getElementById('visitasLp');
    const iniciosCheckoutSpan = document.getElementById('iniciosCheckout');
    const vendasFinalizadasSpan = document.getElementById('vendasFinalizadas');
    const cpaSpan = document.getElementById('cpa');
    const receitaTotalSpan = document.getElementById('receitaTotal');
    const roasAlcancadoSpan = document.getElementById('roasAlcancado'); 
    const taxaConvLpVendaSpan = document.getElementById('taxaConvLpVenda');
    
    const feedbackCpm = document.getElementById('feedbackCpm');
    const feedbackCtr = document.getElementById('feedbackCtr');
    const feedbackConnectRate = document.getElementById('feedbackConnectRate');
    const feedbackTaxaLpCheckout = document.getElementById('feedbackTaxaLpCheckout');
    const feedbackTaxaCheckout = document.getElementById('feedbackTaxaCheckout');

    const benchmarks = {
        cpm: { 
            min: 10, max: 30, ideal: 18, 
            // MODIFICADO AQUI 👇
            msg: "É o custo para cada 1.000 impressões do seu anúncio." 
        },
        ctr: { 
            min: 0.8, max: 2.5, ideal: 1.5, 
            msg: "Percentual de pessoas que clicam no seu anúncio após visualizá-lo." 
        },
        connectRate: { 
            min: 85, max: 98, ideal: 92, 
            msg: "Percentual de cliques que resultaram no carregamento efetivo da sua página de destino (LP)." 
        },
        taxaLpCheckout: { 
            min: 3, max: 10, ideal: 5, 
            msg: "Percentual de visitantes da sua página que iniciam o processo de checkout (compra)." 
        },
        taxaCheckout: { 
            min: 40, max: 80, ideal: 60, 
            msg: "Percentual de pessoas que iniciaram o checkout e de fato finalizaram a compra." 
        }
    };
    
    function formatCurrency(value) {
        if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
        return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    }

    function formatNumber(value) {
        if (isNaN(value) || !isFinite(value)) return '0';
        return Math.round(value).toLocaleString('pt-BR');
    }

    function formatPercentage(value) {
        if (isNaN(value) || !isFinite(value)) return '0,00%';
        return `${value.toFixed(2).replace('.', ',')}%`;
    }
    
    function formatDisplayValue(num, unit, precision = 2) {
        if (isNaN(num) || !isFinite(num)) return "N/A";
        if (unit === '%') {
            return `${num.toFixed(precision).replace('.', ',')}%`;
        } else if (unit === 'R$') {
            return `R$ ${num.toFixed(precision).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        }
        return num.toFixed(precision).replace('.', ',');
    }

    // --- INÍCIO DA FUNÇÃO provideFeedback MODIFICADA ---
    function provideFeedback(inputElement, feedbackElement, benchmark) {
        const value = parseFloat(inputElement.value);
        const ticketMedio = parseFloat(ticketMedioInput.value);
        const investimentoAnuncios = parseFloat(investimentoAnunciosInput.value);
        const roasDesejado = parseFloat(roasDesejadoInput.value);
        
        if (isNaN(ticketMedio) || ticketMedio <= 0 ||
            isNaN(investimentoAnuncios) || investimentoAnuncios <= 0 ||
            isNaN(roasDesejado) || roasDesejado <= 0 ||
            isNaN(value) || value < 0 ) { 
            feedbackElement.textContent = "Por favor, preencha os Dados da Campanha (todos devem ser maiores que zero) e o valor desta métrica (deve ser zero ou maior).";
            feedbackElement.style.color = '#DC3545';
            return;
        }

        const receitaNecessaria = roasDesejado * investimentoAnuncios;
        const vendasNecessarias = (ticketMedio > 0) ? receitaNecessaria / ticketMedio : 0;

        let idealValue = NaN;
        const unitText = (inputElement.id === 'cpm') ? 'R$' : '%';
        let feedbackColor = '#6C757D'; 
        let customMessage = '';

        const currentCtrValue = parseFloat(ctrInput.value) / 100;
        const currentConnectRateValue = parseFloat(connectRateInput.value) / 100;
        const currentTaxaLpCheckoutValue = parseFloat(taxaLpCheckoutInput.value) / 100;
        const currentTaxaCheckoutValue = parseFloat(taxaCheckoutInput.value) / 100;
        const currentCpmValue = parseFloat(cpmInput.value);

        if (vendasNecessarias > 0) {
            if (inputElement.id === 'cpm') {
                if (ticketMedio > 0 && currentCtrValue > 0 && currentConnectRateValue >= 0 && currentTaxaLpCheckoutValue >= 0 && currentTaxaCheckoutValue >= 0) {
                    idealValue = (ticketMedio / roasDesejado) * currentCtrValue * currentConnectRateValue * currentTaxaLpCheckoutValue * currentTaxaCheckoutValue * 1000;
                }
            } else if (inputElement.id === 'ctr') {
                if (currentCpmValue > 0 && investimentoAnuncios > 0) {
                    const denominadorTaxasFunilPosClick = currentConnectRateValue * currentTaxaLpCheckoutValue * currentTaxaCheckoutValue;
                    if (denominadorTaxasFunilPosClick > 0) {
                        idealValue = (vendasNecessarias * currentCpmValue) / (investimentoAnuncios * 1000 * denominadorTaxasFunilPosClick) * 100;
                    }
                }
            } else if (inputElement.id === 'connectRate') {
                if (currentCpmValue > 0 && currentCtrValue > 0 && investimentoAnuncios > 0) {
                    const impressoes = (investimentoAnuncios / currentCpmValue) * 1000;
                    const cliques = impressoes * currentCtrValue;
                    const denominadorTaxasFunilPosVisitaLP = currentTaxaLpCheckoutValue * currentTaxaCheckoutValue;
                    if (cliques > 0 && denominadorTaxasFunilPosVisitaLP > 0) {
                        idealValue = (vendasNecessarias / (cliques * denominadorTaxasFunilPosVisitaLP)) * 100;
                    }
                }
            } else if (inputElement.id === 'taxaLpCheckout') {
                if (currentCpmValue > 0 && currentCtrValue > 0 && currentConnectRateValue >= 0 && investimentoAnuncios > 0) {
                    const impressoes = (investimentoAnuncios / currentCpmValue) * 1000;
                    const cliques = impressoes * currentCtrValue;
                    const visitasLp = cliques * currentConnectRateValue;
                    if (visitasLp > 0 && currentTaxaCheckoutValue > 0) {
                        idealValue = (vendasNecessarias / (visitasLp * currentTaxaCheckoutValue)) * 100;
                    }
                }
            } else if (inputElement.id === 'taxaCheckout') {
                if (currentCpmValue > 0 && currentCtrValue > 0 && currentConnectRateValue >= 0 && currentTaxaLpCheckoutValue >= 0 && investimentoAnuncios > 0) {
                    const impressoes = (investimentoAnuncios / currentCpmValue) * 1000;
                    const cliques = impressoes * currentCtrValue;
                    const visitasLp = cliques * currentConnectRateValue;
                    const iniciosCheckout = visitasLp * currentTaxaLpCheckoutValue;
                    if (iniciosCheckout > 0) {
                        idealValue = (vendasNecessarias / iniciosCheckout) * 100;
                    }
                }
            }
        }
        
        // const benchmarkLiteralExplanation = benchmark.msg; // Esta linha é mantida, mas não será concatenada abaixo

        if (isFinite(idealValue) && idealValue >= 0 && vendasNecessarias > 0) {
            const formattedVal = formatDisplayValue(value, unitText);
            const formattedIdeal = formatDisplayValue(idealValue, unitText, 2); 
            const roasStr = roasDesejado.toFixed(2).replace('.',',');
            // MODIFICADO AQUI para consistência com o tooltip CPM 👇
            const metricTypeSimple = inputElement.id === 'cpm' ? 'custo para cada 1.000 impressões' : 'resultado atual';

            if (inputElement.id === 'cpm') { 
                if (value <= idealValue * 1.05) { 
                    feedbackColor = '#28A745';
                    customMessage = `Ótimo! Seu ${metricTypeSimple} (${formattedVal}) está bom ou até melhor que a meta (${formattedIdeal}) para alcançar o retorno de ${roasStr}x. `;
                } else if (value <= idealValue * 1.25) { 
                    feedbackColor = '#FFC107';
                    customMessage = `Atenção: Seu ${metricTypeSimple} (${formattedVal}) está um pouco acima do ideal (${formattedIdeal}) para o retorno de ${roasStr}x. `;
                } else { 
                    feedbackColor = '#DC3545';
                    customMessage = `Importante: Seu ${metricTypeSimple} (${formattedVal}) está bem acima do ideal (${formattedIdeal}) para o retorno de ${roasStr}x. `;
                }
            } else { 
                if (value >= idealValue * 0.95) { 
                    feedbackColor = '#28A745';
                    customMessage = `Excelente! Seu ${metricTypeSimple} (${formattedVal}) atinge ou supera a meta (${formattedIdeal}) para o retorno de ${roasStr}x. `;
                } else if (value >= idealValue * 0.75) { 
                    feedbackColor = '#FFC107';
                    customMessage = `Atenção: Seu ${metricTypeSimple} (${formattedVal}) está um pouco abaixo da meta (${formattedIdeal}) para o retorno de ${roasStr}x. `;
                } else { 
                    feedbackColor = '#DC3545';
                    customMessage = `Importante: Seu ${metricTypeSimple} (${formattedVal}) está bem abaixo da meta (${formattedIdeal}) para o retorno de ${roasStr}x. `;
                }
            }
            // MODIFICADO AQUI 👇: Removido benchmarkLiteralExplanation
            feedbackElement.textContent = customMessage.trim();
        } else if (isFinite(value) && value >= 0) { 
            const formattedVal = formatDisplayValue(value, unitText);
            if (value < benchmark.min) {
                feedbackColor = inputElement.id === 'cpm' ? '#28A745' : '#FFC107'; 
                customMessage = inputElement.id === 'cpm' ? 
                                `Seu Custo por Mil Impressões (${formattedVal}) está abaixo da média de mercado (${formatDisplayValue(benchmark.min, unitText)}). ` :
                                `Seu resultado (${formattedVal}) está abaixo da média de mercado (${formatDisplayValue(benchmark.min, unitText)}). `;
            } else if (value > benchmark.max) {
                feedbackColor = inputElement.id === 'cpm' ? '#FFC107' : '#28A745'; 
                customMessage = inputElement.id === 'cpm' ?
                                `Seu Custo por Mil Impressões (${formattedVal}) está acima da média de mercado (${formatDisplayValue(benchmark.max, unitText)}). ` :
                                `Seu resultado (${formattedVal}) está acima da média de mercado (${formatDisplayValue(benchmark.max, unitText)}). `;
            } else { 
                feedbackColor = '#6C757D'; 
                customMessage = `Seu resultado (${formattedVal}) está dentro da média de mercado. `;
            }
            
            let metaMsg = "";
            if (vendasNecessarias <= 0 && roasDesejado > 0) { 
                metaMsg = ` Não conseguimos calcular uma meta precisa para seu objetivo de retorno com os dados de campanha fornecidos.`;
            } else if (!isFinite(idealValue) && vendasNecessarias > 0) { 
                metaMsg = ` Não foi possível calcular uma meta para seu objetivo de retorno com os dados atuais das outras métricas do funil.`;
            }
            // MODIFICADO AQUI 👇: Removido benchmarkLiteralExplanation
            feedbackElement.textContent = (`${customMessage} ${metaMsg}`).trim();
        } else { 
            let labelText = "Esta métrica";
            const labelElement = document.querySelector(`label[for="${inputElement.id}"]`); 
            if (labelElement) {
                labelText = labelElement.textContent.split('(')[0].trim();
            } else { 
                const parentP = inputElement.closest('p'); 
                if (parentP) {
                    const metricLabelSpan = parentP.querySelector('.metric-label'); 
                    if (metricLabelSpan) {
                        labelText = metricLabelSpan.childNodes[0].nodeValue.trim(); 
                    }
                }
            }
            // MODIFICADO AQUI 👇: Removido benchmarkLiteralExplanation
            feedbackElement.textContent = `O valor informado para "${labelText}" não é válido.`;
            feedbackColor = '#DC3545'; 
        }
        feedbackElement.style.color = feedbackColor;
    }
    // --- FIM DA FUNÇÃO provideFeedback MODIFICADA ---

    function calculateMetrics() {
        const ticketMedio = parseFloat(ticketMedioInput.value);
        const investimentoAnuncios = parseFloat(investimentoAnunciosInput.value);
        const roasDesejadoVal = parseFloat(roasDesejadoInput.value); 
        const cpm = parseFloat(cpmInput.value);
        const ctr = parseFloat(ctrInput.value) / 100; 
        const connectRate = parseFloat(connectRateInput.value) / 100; 
        const taxaLpCheckout = parseFloat(taxaLpCheckoutInput.value) / 100;
        const taxaCheckout = parseFloat(taxaCheckoutInput.value) / 100; 

        const isAnyInputInvalidForMainCalc = isNaN(ticketMedio) || ticketMedio <= 0 ||
                                             isNaN(investimentoAnuncios) || investimentoAnuncios < 0 || 
                                             isNaN(cpm) || cpm <= 0 || 
                                             isNaN(ctr) || ctr < 0 ||
                                             isNaN(connectRate) || connectRate < 0 ||
                                             isNaN(taxaLpCheckout) || taxaLpCheckout < 0 ||
                                             isNaN(taxaCheckout) || taxaCheckout < 0;

        if (isAnyInputInvalidForMainCalc) {
            const resetValue = (elId) => {
                const el = document.getElementById(elId);
                if (!el) return;
                if (elId === 'roasAlcancado') el.textContent = '0,00x';
                else if (['cpc', 'cpa', 'receitaTotal'].includes(elId)) el.textContent = 'R$ 0,00';
                else if (elId === 'taxaConvLpVenda') el.textContent = '0,00%';
                else el.textContent = '0';
            };
            ['impressoes', 'cliques', 'cpc', 'visitasLp', 'iniciosCheckout', 'vendasFinalizadas', 'cpa', 'receitaTotal', 'roasAlcancado', 'taxaConvLpVenda'].forEach(resetValue);
            
            const FBsToClearOrError = [
                { el: feedbackCpm, input: cpmInput, name: "CPM" }, 
                { el: feedbackCtr, input: ctrInput, name: "CTR" }, 
                { el: feedbackConnectRate, input: connectRateInput, name: "Taxa de Chegada na Página" }, 
                { el: feedbackTaxaLpCheckout, input: taxaLpCheckoutInput, name: "Conversão da Página para Início de Compra" },
                { el: feedbackTaxaCheckout, input: taxaCheckoutInput, name: "Conversão no Pagamento" }
            ];

            let generalError = "";
            if (isNaN(ticketMedio) || ticketMedio <= 0) generalError = "O Preço Médio do Produto deve ser maior que zero. ";
            if (isNaN(investimentoAnuncios) || investimentoAnuncios < 0) generalError += "O Total a Investir deve ser zero ou maior. ";


            FBsToClearOrError.forEach(item => {
                if (item.el) {
                    const metricValue = parseFloat(item.input.value);
                    if (isNaN(metricValue) || metricValue < 0 || (item.input.id === 'cpm' && metricValue <= 0) ) {
                        item.el.textContent = `Valor de "${item.name}" inválido. ${generalError || "Verifique também os Dados da Campanha."}`;
                        item.el.style.color = '#DC3545';
                    } else if (generalError) { 
                         item.el.textContent = generalError + "Corrija os Dados da Campanha para ver o feedback da métrica.";
                         item.el.style.color = '#DC3545';
                    } else if (isNaN(roasDesejadoVal) || roasDesejadoVal <= 0) {
                         item.el.textContent = "O Retorno Desejado deve ser maior que zero para um feedback mais preciso.";
                         item.el.style.color = '#FFC107'; 
                    }
                     else {
                       // Mantido o comportamento original aqui.
                       // Se desejar limpar os feedbacks individuais quando os dados da campanha estão ok mas o ROAS não,
                       // você precisaria adicionar item.el.textContent = ''; aqui, por exemplo.
                       // Ou chamar provideFeedback para cada um, mas isso já é feito no bloco principal.
                       // Por hora, a lógica do provideFeedback será chamada abaixo se não houver erro geral.
                     }
                }
            });
            // Comentário original: Se houver erro geral nos dados da campanha ou ROAS, não prosseguir para o provideFeedback individual
            // Adiciono uma verificação para que, se houver erro geral, os feedbacks das métricas do funil não sejam chamados com provideFeedback
             if(generalError || (isNaN(roasDesejadoVal) || roasDesejadoVal <= 0 && (isNaN(ticketMedio) || ticketMedio <=0 || isNaN(investimentoAnuncios) || investimentoAnuncios <0 ) )) {
                // Se os dados base da campanha estiverem ok, mas o ROAS desejado não,
                // os feedbacks individuais podem ser chamados, mas sem cálculo de 'idealValue'
                // a função provideFeedback já lida com isso.
                // A condição acima previne que provideFeedback seja chamado se os dados de campanha base forem ruins.
             } else if (ticketMedio > 0 && investimentoAnuncios >= 0 && (isNaN(roasDesejadoVal) || roasDesejadoVal > 0 )) {
                 // Este bloco só será alcançado se os dados da campanha estiverem minimamente OK.
             } else { // Se os dados base da campanha forem inválidos, e não apenas o ROAS desejado.
                 return;
             }
        }

        const impressoes = (investimentoAnuncios > 0 && cpm > 0) ? (investimentoAnuncios / cpm) * 1000 : 0;
        const cliques = impressoes * ctr;
        const cpc = (cliques > 0) ? investimentoAnuncios / cliques : 0;
        const visitasLp = cliques * connectRate;
        const iniciosCheckout = visitasLp * taxaLpCheckout;
        const vendasFinalizadas = iniciosCheckout * taxaCheckout;
        const cpa = (vendasFinalizadas > 0) ? investimentoAnuncios / vendasFinalizadas : 0;
        const receitaTotal = vendasFinalizadas * ticketMedio;
        const roasAlcancado = (investimentoAnuncios > 0 && receitaTotal !== 0) ? receitaTotal / investimentoAnuncios : 0; 
        const taxaConvLpVenda = (visitasLp > 0) ? (vendasFinalizadas / visitasLp) * 100 : 0;

        impressoesSpan.textContent = formatNumber(impressoes);
        cliquesSpan.textContent = formatNumber(cliques);
        cpcSpan.textContent = formatCurrency(cpc);
        visitasLpSpan.textContent = formatNumber(visitasLp);
        iniciosCheckoutSpan.textContent = formatNumber(iniciosCheckout);
        vendasFinalizadasSpan.textContent = formatNumber(vendasFinalizadas);
        cpaSpan.textContent = formatCurrency(cpa);
        receitaTotalSpan.textContent = formatCurrency(receitaTotal);
        
        if (roasAlcancadoSpan) roasAlcancadoSpan.textContent = roasAlcancado.toFixed(2).replace('.', ',') + 'x';

        taxaConvLpVendaSpan.textContent = formatPercentage(taxaConvLpVenda);

        // Chama provideFeedback para cada métrica do funil
        if (ticketMedio > 0 && investimentoAnuncios >= 0 && (isNaN(roasDesejadoVal) || roasDesejadoVal > 0 )) { 
            provideFeedback(cpmInput, feedbackCpm, benchmarks.cpm);
            provideFeedback(ctrInput, feedbackCtr, benchmarks.ctr);
            provideFeedback(connectRateInput, feedbackConnectRate, benchmarks.connectRate);
            provideFeedback(taxaLpCheckoutInput, feedbackTaxaLpCheckout, benchmarks.taxaLpCheckout);
            provideFeedback(taxaCheckoutInput, feedbackTaxaCheckout, benchmarks.taxaCheckout);
        } else { 
            const baseMessage = "Preencha os Dados da Campanha (Preço Médio > 0, Investimento >=0) ";
            const roasMessage = (isNaN(roasDesejadoVal) || roasDesejadoVal <= 0) ? "e o Retorno Desejado (>0) " : "";
            const finalMessage = baseMessage + roasMessage + "para um feedback mais detalhado das métricas do funil.";
            [feedbackCpm, feedbackCtr, feedbackConnectRate, feedbackTaxaLpCheckout, feedbackTaxaCheckout].forEach(fb => {
                if (fb) {
                    fb.textContent = finalMessage;
                    fb.style.color = '#FFC107'; 
                }
            });
        }
    }

    const allInputs = document.querySelectorAll('.input-section input[type="number"], .input-group input[type="number"]');
    allInputs.forEach(input => {
        input.addEventListener('input', calculateMetrics);
    });

    calculateMetrics(); 
});