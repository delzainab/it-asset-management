import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useRole from '../../hooks/useRole';
import api from '../../services/api';
import assetService from '../../services/asset.service';

const Reports = () => {
  const { isAdmin } = useRole();
  const [reportType, setReportType] = useState('assets');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const generateReport = async () => {
    setGenerating(true);
    setError('');
    try {
      let data = {};

      switch (reportType) {
        case 'assets':
          const assets = await assetService.getAllAssets();
          data = {
            title: 'Rapport des Assets',
            columns: ['Type', 'Marque', 'Modèle', 'N° Série', 'Code Inventaire', 'Statut', 'État', 'Date d\'achat', 'Fin garantie'],
            rows: assets.map(a => [
              a.type, a.brand, a.model, a.serialNumber, a.inventoryCode,
              a.status === 'EN_STOCK' ? 'En stock' : (a.status === 'AFFECTE' ? 'Affecté' : (a.status === 'EN_REPARATION' ? 'En réparation' : 'Sorti')),
              a.condition === 'NEUF' ? 'Neuf' : (a.condition === 'BON' ? 'Bon' : (a.condition === 'MOYEN' ? 'Moyen' : (a.condition === 'HS' ? 'Hors service' : 'Réformé'))),
              a.purchaseDate || '-', a.warrantyEndDate || '-'
            ]),
            summary: {
              total: assets.length,
              byStatus: {
                'En stock': assets.filter(a => a.status === 'EN_STOCK').length,
                'Affecté': assets.filter(a => a.status === 'AFFECTE').length,
                'En réparation': assets.filter(a => a.status === 'EN_REPARATION').length,
                'Sorti': assets.filter(a => a.status === 'SORTI').length
              }
            }
          };
          break;

        case 'tickets':
          const ticketsRes = await api.get('/tickets');
          const tickets = ticketsRes.data;
          data = {
            title: 'Rapport des Tickets',
            columns: ['ID', 'Titre', 'Priorité', 'Statut', 'Créé par', 'Date création', 'Matériel'],
            rows: tickets.map(t => [
              t.id, t.title,
              t.priority === 'CRITIQUE' ? 'Critique' : (t.priority === 'ELEVEE' ? 'Élevée' : (t.priority === 'MOYENNE' ? 'Moyenne' : 'Basse')),
              t.status === 'OUVERT' ? 'Ouvert' : (t.status === 'EN_COURS' ? 'En cours' : (t.status === 'RESOLU' ? 'Résolu' : 'Fermé')),
              t.createdBy?.fullName || '-',
              new Date(t.createdAt).toLocaleDateString(),
              t.asset?.type || '-'
            ]),
            summary: {
              total: tickets.length,
              byStatus: {
                'Ouvert': tickets.filter(t => t.status === 'OUVERT').length,
                'En cours': tickets.filter(t => t.status === 'EN_COURS').length,
                'Résolu': tickets.filter(t => t.status === 'RESOLU').length,
                'Fermé': tickets.filter(t => t.status === 'FERME').length
              }
            }
          };
          break;

        case 'maintenances':
          try {
            const response = await api.get('/maintenances/all');
            let maintenances = response.data || [];
            if (maintenances.length === 0) {
              const fallbackRes = await api.get('/maintenances');
              maintenances = fallbackRes.data || [];
            }
            console.log('Maintenances chargées :', maintenances.length);
            data = {
              title: 'Rapport des Maintenances',
              columns: ['ID', 'Matériel', 'Type', 'Problème', 'Date', 'Durée', 'Coût', 'Statut'],
              rows: maintenances.map(m => [
                m.id,
                `${m.asset?.type || ''} - ${m.asset?.brand || ''} ${m.asset?.model || ''}`,
                m.type === 'PREVENTIVE' ? 'Préventive' : 'Corrective',
                m.problemDescription?.substring(0, 50) || '-',
                m.interventionDate ? new Date(m.interventionDate).toLocaleDateString() : '-',
                m.duration ? `${m.duration} min` : '-',
                m.cost ? `${m.cost} DH` : '-',
                m.status === 'PLANIFIE' ? 'Planifiée' : (m.status === 'EN_COURS' ? 'En cours' : 'Terminée')
              ]),
              summary: {
                total: maintenances.length,
                totalCost: maintenances.reduce((sum, m) => sum + (m.cost || 0), 0),
                byType: {
                  'Préventive': maintenances.filter(m => m.type === 'PREVENTIVE').length,
                  'Corrective': maintenances.filter(m => m.type === 'CORRECTIVE').length
                },
                byStatus: {
                  'Planifiée': maintenances.filter(m => m.status === 'PLANIFIE').length,
                  'En cours': maintenances.filter(m => m.status === 'EN_COURS').length,
                  'Terminée': maintenances.filter(m => m.status === 'TERMINE').length
                }
              }
            };
          } catch (err) {
            console.error('Erreur chargement maintenances :', err);
            data = {
              title: 'Rapport des Maintenances',
              columns: ['ID', 'Matériel', 'Type', 'Problème', 'Date', 'Durée', 'Coût', 'Statut'],
              rows: [],
              summary: { total: 0, totalCost: 0, byType: {}, byStatus: {} }
            };
          }
          break;

        case 'users':
          const usersRes = await api.get('/users');
          const users = usersRes.data;
          data = {
            title: 'Rapport des Utilisateurs',
            columns: ['Nom', 'Email', 'Rôle', 'Statut', 'Date création'],
            rows: users.map(u => [
              u.fullName, u.email, u.role?.name || '-', u.active ? 'Actif' : 'Inactif',
              new Date(u.createdAt).toLocaleDateString()
            ]),
            summary: {
              total: users.length,
              byRole: users.reduce((acc, u) => {
                acc[u.role?.name || 'Sans rôle'] = (acc[u.role?.name || 'Sans rôle'] || 0) + 1;
                return acc;
              }, {})
            }
          };
          break;

        default:
          data = { title: 'Rapport', columns: [], rows: [], summary: {} };
      }

      setReportData(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };
const exportToCSV = () => {
  if (!reportData) return;

  // Ajouter le BOM (Byte Order Mark) pour UTF-8
  const BOM = "\uFEFF";
  
  // Créer les lignes du CSV
  const csvRows = [reportData.columns.join(';')]; // Utilise ';' comme séparateur (meilleur pour Excel français)
  
  reportData.rows.forEach(row => {
    // Échapper les guillemets et entourer chaque cellule de guillemets
    const escapedRow = row.map(cell => {
      if (cell === undefined || cell === null) return '""';
      const str = String(cell);
      // Remplacer les guillemets par des doubles guillemets
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(';');
    csvRows.push(escapedRow);
  });
  
  const csvContent = BOM + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportData.title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
 
  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF('landscape');
    const title = reportData.title;
    const date = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    const periodeTexte = `Periode: ${dateRange.startDate} au ${dateRange.endDate}`;
    doc.text(periodeTexte, 14, 25);
    doc.text(`Genere le ${date}`, 14, 32);

    const tableColumn = reportData.columns;
    const tableRows = reportData.rows;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
      headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`${reportData.title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const reportTypes = [
    { value: 'assets', label: 'Rapport des Assets', icon: '💻' },
    { value: 'tickets', label: 'Rapport des Tickets', icon: '🎫' },
    { value: 'maintenances', label: 'Rapport des Maintenances', icon: '🔧' },
    { value: 'users', label: 'Rapport des Utilisateurs', icon: '👥' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Rapports et Analyses</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Générer un rapport</Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type de rapport</InputLabel>
              <Select value={reportType} label="Type de rapport" onChange={(e) => setReportType(e.target.value)}>
                {reportTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.icon} {type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth label="Date début" type="date" value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Date fin" type="date" value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ mb: 3 }}
            />

            <Button
              fullWidth variant="contained" onClick={generateReport} disabled={generating}
              sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
            >
              {generating ? <CircularProgress size={24} /> : 'Générer le rapport'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {reportData && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                  {reportData.title}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    Généré le {new Date().toLocaleDateString()}
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<ExcelIcon />} onClick={exportToCSV}>Excel</Button>
                  <Button size="small" variant="outlined" startIcon={<PdfIcon />} onClick={exportToPDF}>PDF</Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Résumé statistique */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Card><CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">{reportData.summary.total || 0}</Typography>
                    <Typography variant="caption">Total</Typography>
                  </CardContent></Card>
                </Grid>
                {reportData.summary.totalCost !== undefined && (
                  <Grid item xs={4}>
                    <Card><CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning">{reportData.summary.totalCost} DH</Typography>
                      <Typography variant="caption">Coût total</Typography>
                    </CardContent></Card>
                  </Grid>
                )}
                <Grid item xs={4}>
                  <Card><CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Période</Typography>
                    <Typography variant="caption">{dateRange.startDate} → {dateRange.endDate}</Typography>
                  </CardContent></Card>
                </Grid>
              </Grid>

              {reportType === 'maintenances' && reportData.summary.byType && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Répartition par type :</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Préventive: ${reportData.summary.byType['Préventive'] || 0}`} color="info" />
                    <Chip label={`Corrective: ${reportData.summary.byType['Corrective'] || 0}`} color="warning" />
                  </Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Répartition par statut :</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Planifiée: ${reportData.summary.byStatus['Planifiée'] || 0}`} color="default" />
                    <Chip label={`En cours: ${reportData.summary.byStatus['En cours'] || 0}`} color="warning" />
                    <Chip label={`Terminée: ${reportData.summary.byStatus['Terminée'] || 0}`} color="success" />
                  </Box>
                </Box>
              )}

              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {reportData.columns.map((col, idx) => (
                        <TableCell key={idx} sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>{col}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.rows.map((row, idx) => (
                      <TableRow key={idx} hover>
                        {row.map((cell, cellIdx) => <TableCell key={cellIdx}>{cell}</TableCell>)}
                      </TableRow>
                    ))}
                    {reportData.rows.length === 0 && (
                      <TableRow><TableCell colSpan={reportData.columns.length} align="center">Aucune donnée trouvée</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;