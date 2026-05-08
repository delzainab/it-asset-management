import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    action: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs');
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];
    
    if (filters.search) {
      filtered = filtered.filter(log => 
        log.user?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.user?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.entityName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.action?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.details?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getActionChip = (action) => {
    const colors = {
      'CREATE': 'success',
      'UPDATE': 'info',
      'DELETE': 'error',
      'ASSIGN': 'warning',
      'RETURN': 'warning',
      'MAINTENANCE': 'secondary',
      'TICKET': 'default'
    };
    const labels = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'ASSIGN': 'Affectation',
      'RETURN': 'Retour',
      'MAINTENANCE': 'Maintenance',
      'TICKET': 'Ticket'
    };
    return <Chip size="small" color={colors[action] || 'default'} label={labels[action] || action} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit Logs - Historique des actions
      </Typography>

      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher (utilisateur, entité, action, détails...)"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select name="action" value={filters.action} label="Action" onChange={handleFilterChange}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="CREATE">Création</MenuItem>
                <MenuItem value="UPDATE">Modification</MenuItem>
                <MenuItem value="DELETE">Suppression</MenuItem>
                <MenuItem value="ASSIGN">Affectation</MenuItem>
                <MenuItem value="RETURN">Retour</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="TICKET">Ticket</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date/Heure</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entité</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun log trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.user?.fullName}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {log.user?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{getActionChip(log.action)}</TableCell>
                  <TableCell>{log.entityName}</TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>
                    <Tooltip title={log.details || '-'} arrow>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 400, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {log.details || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogList;