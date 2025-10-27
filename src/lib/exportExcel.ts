import * as XLSX from 'xlsx';

type ReportData = {
  register: {
    id: string;
    title: string;
    lastReviewedAt: Date | string | null;
    nextReviewDate: Date | string | null;
  };
  summary: {
    totalRisks: number;
    averageInherentRisk: number;
    averageResidualRisk: number;
    riskReduction: number;
  };
  riskMatrix: {
    data: Array<{
      likelihood: number;
      impact: number;
      count: number;
      risks: any[];
    }>;
  };
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  topRisks: Array<{
    id: string;
    title: string;
    category: string | null;
    priority: string;
    inherentRisk: number;
    residualRisk: number | null;
    status: string;
    controlsCount: number;
    controlsImplemented: number;
  }>;
  controlEffectiveness: {
    total: number;
    implemented: number;
    percentage: number;
  };
  protocolStats: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  generatedAt: string;
};

export function exportReportToExcel(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Resumen Ejecutivo
  const summaryData = [
    ['REPORTE DE ANÁLISIS DE RIESGOS'],
    [''],
    ['Registro:', data.register.title],
    ['Generado:', new Date(data.generatedAt).toLocaleString('es-AR')],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Métrica', 'Valor'],
    ['Total de Riesgos', data.summary.totalRisks],
    ['Riesgo Inherente Promedio', `${data.summary.averageInherentRisk}/25`],
    ['Riesgo Residual Promedio', `${data.summary.averageResidualRisk}/25`],
    ['Reducción de Riesgo', `${data.summary.riskReduction}%`],
    [''],
    ['EFECTIVIDAD DE CONTROLES'],
    ['Total de Controles', data.controlEffectiveness.total],
    ['Controles Implementados', data.controlEffectiveness.implemented],
    ['Porcentaje de Efectividad', `${data.controlEffectiveness.percentage}%`],
    [''],
    ['ESTADÍSTICAS DE PROTOCOLOS'],
    ['Total de Protocolos', data.protocolStats.total],
    ['Completados', data.protocolStats.completed],
    ['En Progreso', data.protocolStats.inProgress],
    ['Progreso Promedio', `${data.protocolStats.averageProgress}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 20 },
  ];

  // Apply styles to headers
  if (summarySheet['A1']) summarySheet['A1'].s = { font: { bold: true, sz: 14 } };
  if (summarySheet['A6']) summarySheet['A6'].s = { font: { bold: true } };
  if (summarySheet['A13']) summarySheet['A13'].s = { font: { bold: true } };
  if (summarySheet['A18']) summarySheet['A18'].s = { font: { bold: true } };

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Sheet 2: Distribución por Prioridad
  const priorityData = [
    ['DISTRIBUCIÓN POR PRIORIDAD'],
    [''],
    ['Prioridad', 'Cantidad'],
    ['Críticos', data.priorityDistribution.CRITICAL || 0],
    ['Altos', data.priorityDistribution.HIGH || 0],
    ['Medios', data.priorityDistribution.MEDIUM || 0],
    ['Bajos', data.priorityDistribution.LOW || 0],
  ];

  const prioritySheet = XLSX.utils.aoa_to_sheet(priorityData);
  prioritySheet['!cols'] = [{ wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, prioritySheet, 'Por Prioridad');

  // Sheet 3: Distribución por Estado
  const statusLabels: Record<string, string> = {
    IDENTIFIED: 'Identificado',
    ANALYZING: 'En Análisis',
    MITIGATING: 'Mitigando',
    MONITORING: 'Monitoreando',
    CLOSED: 'Cerrado',
  };

  const statusData: any[][] = [
    ['DISTRIBUCIÓN POR ESTADO'],
    [''],
    ['Estado', 'Cantidad'],
  ];

  Object.entries(data.statusDistribution).forEach(([status, count]) => {
    statusData.push([statusLabels[status] || status, count]);
  });

  const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
  statusSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, statusSheet, 'Por Estado');

  // Sheet 4: Distribución por Categoría
  const categoryData: any[][] = [
    ['DISTRIBUCIÓN POR CATEGORÍA'],
    [''],
    ['Categoría', 'Cantidad'],
  ];

  Object.entries(data.categoryDistribution).forEach(([category, count]) => {
    categoryData.push([category, count]);
  });

  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  categorySheet['!cols'] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');

  // Sheet 5: Top 10 Riesgos
  const topRisksData: any[][] = [
    ['TOP 10 RIESGOS PRINCIPALES'],
    [''],
    ['#', 'Riesgo', 'Categoría', 'Prioridad', 'Riesgo Inherente', 'Riesgo Residual', 'Estado', 'Controles Total', 'Controles Implementados'],
  ];

  data.topRisks.forEach((risk, index) => {
    topRisksData.push([
      index + 1,
      risk.title,
      risk.category || 'N/A',
      risk.priority,
      risk.inherentRisk,
      risk.residualRisk || 'N/A',
      risk.status,
      risk.controlsCount,
      risk.controlsImplemented,
    ]);
  });

  const topRisksSheet = XLSX.utils.aoa_to_sheet(topRisksData);
  topRisksSheet['!cols'] = [
    { wch: 5 },
    { wch: 40 },
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, topRisksSheet, 'Top 10 Riesgos');

  // Sheet 6: Matriz de Riesgos 5x5
  const matrixData: any[][] = [
    ['MATRIZ DE RIESGOS 5x5'],
    [''],
    ['Probabilidad/Impacto', 'Insignificante (1)', 'Menor (2)', 'Moderado (3)', 'Mayor (4)', 'Catastrófico (5)'],
  ];

  const likelihoodLabels = [
    'Casi Seguro (5)',
    'Probable (4)',
    'Posible (3)',
    'Improbable (2)',
    'Raro (1)',
  ];

  [5, 4, 3, 2, 1].forEach((likelihood, idx) => {
    const row = [likelihoodLabels[idx]];
    [1, 2, 3, 4, 5].forEach((impact) => {
      const cell = data.riskMatrix.data.find(
        (c) => c.likelihood === likelihood && c.impact === impact
      );
      const score = likelihood * impact;
      row.push(`${cell?.count || 0} riesgos (Score: ${score})`);
    });
    matrixData.push(row);
  });

  const matrixSheet = XLSX.utils.aoa_to_sheet(matrixData);
  matrixSheet['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matriz 5x5');

  // Sheet 7: Detalle Completo de Riesgos
  const detailData: any[][] = [
    ['DETALLE COMPLETO DE RIESGOS'],
    [''],
  ];

  if (data.topRisks.length > 0) {
    // Get all risks with their details
    const riskMatrix = data.riskMatrix.data;
    const allRisks: any[] = [];

    riskMatrix.forEach(cell => {
      if (cell.risks && cell.risks.length > 0) {
        cell.risks.forEach(risk => {
          allRisks.push({
            ...risk,
            likelihood: cell.likelihood,
            impact: cell.impact,
          });
        });
      }
    });

    if (allRisks.length > 0) {
      detailData.push(['ID', 'Título', 'Prioridad', 'Riesgo Inherente', 'Probabilidad', 'Impacto']);

      allRisks.forEach(risk => {
        detailData.push([
          risk.id,
          risk.title,
          risk.priority,
          risk.inherentRisk,
          risk.likelihood,
          risk.impact,
        ]);
      });
    }
  }

  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  detailSheet['!cols'] = [
    { wch: 30 },
    { wch: 50 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalle de Riesgos');

  // Generate file
  const fileName = `reporte-riesgos-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
