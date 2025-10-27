import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export function exportReportToPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Análisis de Riesgos', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date(data.generatedAt).toLocaleString('es-AR')}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text(`${data.register.title}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryData = [
    ['Total de Riesgos', data.summary.totalRisks.toString()],
    ['Riesgo Inherente Promedio', `${data.summary.averageInherentRisk}/25`],
    ['Riesgo Residual Promedio', `${data.summary.averageResidualRisk}/25`],
    ['Reducción de Riesgo', `${data.summary.riskReduction}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Priority Distribution
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribución por Prioridad', 14, yPosition);
  yPosition += 8;

  const priorityData = [
    ['Críticos', data.priorityDistribution.CRITICAL?.toString() || '0'],
    ['Altos', data.priorityDistribution.HIGH?.toString() || '0'],
    ['Medios', data.priorityDistribution.MEDIUM?.toString() || '0'],
    ['Bajos', data.priorityDistribution.LOW?.toString() || '0'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Prioridad', 'Cantidad']],
    body: priorityData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Status Distribution
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribución por Estado', 14, yPosition);
  yPosition += 8;

  const statusLabels: Record<string, string> = {
    IDENTIFIED: 'Identificado',
    ANALYZING: 'En Análisis',
    MITIGATING: 'Mitigando',
    MONITORING: 'Monitoreando',
    CLOSED: 'Cerrado',
  };

  const statusData = Object.entries(data.statusDistribution).map(([status, count]) => [
    statusLabels[status] || status,
    count.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Estado', 'Cantidad']],
    body: statusData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  // New page for top risks
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Riesgos Principales', 14, yPosition);
  yPosition += 8;

  const topRisksData = data.topRisks.map((risk, index) => [
    (index + 1).toString(),
    risk.title,
    risk.category || 'N/A',
    risk.priority,
    `${risk.inherentRisk}/25`,
    `${risk.controlsImplemented}/${risk.controlsCount}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Riesgo', 'Categoría', 'Prioridad', 'Riesgo', 'Controles']],
    body: topRisksData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Control Effectiveness
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Efectividad de Controles', 14, yPosition);
  yPosition += 8;

  const controlData = [
    ['Total de Controles', data.controlEffectiveness.total.toString()],
    ['Controles Implementados', data.controlEffectiveness.implemented.toString()],
    ['Porcentaje de Efectividad', `${data.controlEffectiveness.percentage}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: controlData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Protocol Stats
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estadísticas de Protocolos', 14, yPosition);
  yPosition += 8;

  const protocolData = [
    ['Total de Protocolos', data.protocolStats.total.toString()],
    ['Completados', data.protocolStats.completed.toString()],
    ['En Progreso', data.protocolStats.inProgress.toString()],
    ['Progreso Promedio', `${data.protocolStats.averageProgress}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: protocolData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  // Risk Matrix on new page
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Matriz de Riesgos 5x5', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const matrixHeaders = ['L/I', 'Insignif.', 'Menor', 'Moderado', 'Mayor', 'Catastróf.'];
  const likelihoodLabels = ['Casi Seguro', 'Probable', 'Posible', 'Improbable', 'Raro'];

  const matrixData = [5, 4, 3, 2, 1].map((likelihood, idx) => {
    const row = [likelihoodLabels[idx]];
    [1, 2, 3, 4, 5].forEach((impact) => {
      const cell = data.riskMatrix.data.find(
        (c) => c.likelihood === likelihood && c.impact === impact
      );
      const score = likelihood * impact;
      row.push(`${cell?.count || 0} (${score})`);
    });
    return row;
  });

  autoTable(doc, {
    startY: yPosition,
    head: [matrixHeaders],
    body: matrixData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
    styles: { fontSize: 8, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index > 0) {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const likelihood = [5, 4, 3, 2, 1][rowIndex];
        const impact = colIndex;
        const score = likelihood * impact;

        // Color coding based on risk score
        if (score >= 15) {
          data.cell.styles.fillColor = [239, 68, 68]; // red-500
          data.cell.styles.textColor = [255, 255, 255];
        } else if (score >= 10) {
          data.cell.styles.fillColor = [249, 115, 22]; // orange-500
          data.cell.styles.textColor = [255, 255, 255];
        } else if (score >= 5) {
          data.cell.styles.fillColor = [234, 179, 8]; // yellow-500
          data.cell.styles.textColor = [0, 0, 0];
        } else {
          data.cell.styles.fillColor = [59, 130, 246]; // blue-500
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
    },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `reporte-riesgos-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
