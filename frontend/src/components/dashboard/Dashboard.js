import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Build as BuildIcon,
  ConfirmationNumber as TicketIcon,
  Refresh as RefreshIcon,
  Laptop as LaptopIcon,
  DesktopWindows as DesktopIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import assetService from '../../services/asset.service';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAssets: 0, totalMaintenances: 0, openTickets: 0 });
  const [recentAssets, setRecentAssets] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [assetsByType, setAssetsByType] = useState([]);
  const [ticketsByMonth, setTicketsByMonth] = useState([]);
  const [maintenancesByMonth, setMaintenancesByMonth] = useState([]);

  // Couleurs officielles GLPI
  const colors = {
    primary: '#e67e22',    // Orange GLPI
    secondary: '#2c3e50',  // Bleu foncé GLPI
    success: '#27ae60',
    warning: '#f1c40f',
    danger: '#e74c3c',
    info: '#3498db',
    light: '#ecf0f1',
    dark: '#34495e',
    gray: '#95a5a6',
    border: '#e9ecef',
    bgHover: '#f8f9fa'
  };

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const assets = await assetService.getAllAssets();
      const totalAssets = assets.length;

      let totalMaintenances = 0, maintenances = [];
      try { const res = await api.get('/maintenances/all'); maintenances = res.data || []; totalMaintenances = maintenances.length; } catch(e) {}

      let tickets = [], openTicketsCount = 0;
      try { const res = await api.get('/tickets'); tickets = res.data || []; openTicketsCount = tickets.filter(t => t.status !== 'FERME' && t.status !== 'RESOLU').length; } catch(e) {}

      setStats({ totalAssets, totalMaintenances, openTickets: openTicketsCount });
      setRecentAssets([...assets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      setRecentTickets([...tickets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

      const typeMap = new Map();
      assets.forEach(a => typeMap.set(a.type, (typeMap.get(a.type) || 0) + 1));
      setAssetsByType(Array.from(typeMap.entries()).map(([name, value]) => ({ name, value, percent: (value / totalAssets) * 100 })));

      const ticketsByMonthMap = new Map();
      tickets.forEach(t => {
        const date = new Date(t.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        ticketsByMonthMap.set(month, (ticketsByMonthMap.get(month) || 0) + 1);
      });
      setTicketsByMonth(Array.from(ticketsByMonthMap.entries()).map(([month, count]) => ({ month, tickets: count })).sort((a,b) => a.month.localeCompare(b.month)).slice(-6));

      const maintByMonthMap = new Map();
      maintenances.forEach(m => {
        const date = m.interventionDate ? new Date(m.interventionDate) : new Date(m.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        maintByMonthMap.set(month, (maintByMonthMap.get(month) || 0) + 1);
      });
      setMaintenancesByMonth(Array.from(maintByMonthMap.entries()).map(([month, count]) => ({ month, maintenances: count })).sort((a,b) => a.month.localeCompare(b.month)).slice(-6));
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const getStatusChip = (status) => {
    const config = {
      'EN_STOCK': { label: 'En stock', color: colors.success },
      'AFFECTE': { label: 'Affecté', color: colors.info },
      'EN_REPARATION': { label: 'En réparation', color: colors.warning },
      'SORTI': { label: 'Sorti', color: colors.gray }
    };
    const c = config[status] || { label: status, color: colors.primary };
    return <Chip label={c.label} size="small" sx={{ bgcolor: `${c.color}15`, color: c.color, fontSize: '0.7rem', height: 22, fontWeight: 500, borderRadius: 1 }} />;
  };

  const getPriorityChip = (priority) => {
    const config = {
      'CRITIQUE': { label: 'Critique', color: colors.danger },
      'ELEVEE': { label: 'Haute', color: colors.danger },
      'MOYENNE': { label: 'Moyenne', color: colors.warning },
      'BASSE': { label: 'Basse', color: colors.success }
    };
    const c = config[priority] || { label: priority, color: colors.gray };
    return <Chip label={c.label} size="small" sx={{ bgcolor: `${c.color}15`, color: c.color, fontSize: '0.65rem', height: 20, fontWeight: 500, borderRadius: 1 }} />;
  };

  const StatCard = ({ title, value, icon, onClick }) => (
    <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: colors.bgHover, borderColor: colors.primary }, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}` }} onClick={onClick}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.8rem', color: colors.secondary }}>{value}</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.gray }}>{title}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${colors.primary}10`, color: colors.primary, width: 42, height: 42 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}><CircularProgress sx={{ color: colors.primary }} /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.secondary }}>Tableau de Bord</Typography>
        <Typography variant="body2" sx={{ color: colors.gray }}>Bienvenue, {user?.fullName || 'Administrateur'}</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="MATÉRIELS" value={stats.totalAssets} icon={<ComputerIcon />} onClick={() => navigate('/assets')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="MAINTENANCES" value={stats.totalMaintenances} icon={<BuildIcon />} onClick={() => navigate('/maintenances')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="TICKETS OUVERTS" value={stats.openTickets} icon={<TicketIcon />} onClick={() => navigate('/tickets')} />
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.secondary, mb: 1 }}>📈 Évolution des tickets</Typography>
            <Divider sx={{ mb: 2, borderColor: colors.border }} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ticketsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: colors.gray }} />
                <YAxis tick={{ fontSize: 10, fill: colors.gray }} width={25} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 12 }} />
                <Area type="monotone" dataKey="tickets" stroke={colors.primary} fill={colors.primary} fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.secondary, mb: 1 }}>🔧 Évolution des maintenances</Typography>
            <Divider sx={{ mb: 2, borderColor: colors.border }} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={maintenancesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: colors.gray }} />
                <YAxis tick={{ fontSize: 10, fill: colors.gray }} width={25} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 12 }} />
                <Area type="monotone" dataKey="maintenances" stroke={colors.secondary} fill={colors.secondary} fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Section basse */}
      <Grid container spacing={2}>
        {/* Répartition par type */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}`, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.secondary, mb: 1.5 }}>📊 Répartition par type</Typography>
            <Divider sx={{ mb: 2, borderColor: colors.border }} />
            {assetsByType.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: colors.secondary }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: colors.gray }}>{item.value} ({item.percent.toFixed(0)}%)</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={item.percent} 
                  sx={{ height: 4, borderRadius: 2, bgcolor: colors.border, '& .MuiLinearProgress-bar': { bgcolor: colors.primary, borderRadius: 2 } }} 
                />
              </Box>
            ))}
            {assetsByType.length === 0 && <Typography sx={{ color: colors.gray, textAlign: 'center', py: 3, fontSize: '0.8rem' }}>Aucune donnée</Typography>}
          </Paper>
        </Grid>

        {/* Derniers matériels */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}`, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.secondary }}>📦 Derniers matériels</Typography>
              <Chip 
                label="Voir tout" 
                size="small" 
                onClick={() => navigate('/assets')} 
                sx={{ 
                  cursor: 'pointer', 
                  height: 24, 
                  fontSize: '0.65rem', 
                  bgcolor: `${colors.primary}10`, 
                  color: colors.primary,
                  fontWeight: 500,
                  '&:hover': { bgcolor: `${colors.primary}20` }
                }} 
              />
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: colors.border }} />
            {recentAssets.map((asset, idx) => (
              <Box key={asset.id} sx={{ cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: colors.bgHover }, mb: idx < recentAssets.length - 1 ? 1 : 0 }} onClick={() => navigate(`/assets/${asset.id}`)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: `${colors.primary}10`, color: colors.primary }}>
                      {asset.type?.includes('Laptop') ? <LaptopIcon sx={{ fontSize: 14 }} /> : <DesktopIcon sx={{ fontSize: 14 }} />}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: colors.secondary }} noWrap>{asset.type} {asset.model}</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.gray }}>{asset.inventoryCode || asset.code}</Typography>
                    </Box>
                  </Box>
                  {getStatusChip(asset.status)}
                </Box>
              </Box>
            ))}
            {recentAssets.length === 0 && <Typography sx={{ color: colors.gray, textAlign: 'center', py: 3, fontSize: '0.8rem' }}>Aucun matériel récent</Typography>}
          </Paper>
        </Grid>

        {/* Derniers tickets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: 'none', border: `1px solid ${colors.border}`, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.secondary }}>🎫 Derniers tickets</Typography>
              <Chip 
                label="Voir tout" 
                size="small" 
                onClick={() => navigate('/tickets')} 
                sx={{ 
                  cursor: 'pointer', 
                  height: 24, 
                  fontSize: '0.65rem', 
                  bgcolor: `${colors.primary}10`, 
                  color: colors.primary,
                  fontWeight: 500,
                  '&:hover': { bgcolor: `${colors.primary}20` }
                }} 
              />
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: colors.border }} />
            {recentTickets.map((ticket, idx) => (
              <Box key={ticket.id} sx={{ cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { bgcolor: colors.bgHover }, mb: idx < recentTickets.length - 1 ? 1 : 0 }} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: colors.secondary }} noWrap>#{ticket.id} - {ticket.title}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.gray, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      {ticket.createdBy?.fullName?.split(' ')[0] || '-'} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {getPriorityChip(ticket.priority)}
                </Box>
              </Box>
            ))}
            {recentTickets.length === 0 && <Typography sx={{ color: colors.gray, textAlign: 'center', py: 3, fontSize: '0.8rem' }}>Aucun ticket récent</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;