import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import assetService from '../../services/asset.service';
import useRole from '../../hooks/useRole';

const AssetList = () => {
  const navigate = useNavigate();
  const { isAdmin, isTechnician, isConsultation } = useRole();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    condition: ''
  });

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, assets]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAllAssets();
      setAssets(data);
      setFilteredAssets(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des matériels');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];
    
    if (filters.search) {
      filtered = filtered.filter(asset => 
        asset.serialNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.inventoryCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.type?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.model?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(asset => asset.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }
    
    if (filters.condition) {
      filtered = filtered.filter(asset => asset.condition === filters.condition);
    }
    
    setFilteredAssets(filtered);
  };

  const handleDeleteClick = (asset) => {
    if (!isAdmin) {
      setError('Vous n\'avez pas les droits pour supprimer un matériel');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (asset.status === 'AFFECTE') {
      setError(`Impossible de supprimer "${asset.type} - ${asset.brand} ${asset.model}" car il est affecté.`);
      return;
    }
    
    if (asset.status === 'EN_REPARATION') {
      setError(`Impossible de supprimer "${asset.type} - ${asset.brand} ${asset.model}" car il est en réparation.`);
      return;
    }
    
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    
    try {
      await assetService.deleteAsset(assetToDelete.id);
      setSuccess(`"${assetToDelete.type} - ${assetToDelete.brand} ${assetToDelete.model}" supprimé avec succès`);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
      loadAssets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', type: '', status: '', condition: '' });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'EN_STOCK': { color: 'success', label: 'En stock' },
      'AFFECTE': { color: 'primary', label: 'Affecté' },
      'EN_REPARATION': { color: 'warning', label: 'En réparation' },
      'SORTI': { color: 'default', label: 'Sorti' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getConditionChip = (condition) => {
    const conditionConfig = {
      'NEUF': { color: 'success', label: 'Neuf' },
      'BON': { color: 'info', label: 'Bon' },
      'MOYEN': { color: 'warning', label: 'Moyen' },
      'HS': { color: 'error', label: 'HS' },
      'REFORME': { color: 'default', label: 'Réformé' }
    };
    const config = conditionConfig[condition] || { color: 'default', label: condition };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const typeOptions = ['PC', 'Laptop', 'Écran', 'Imprimante', 'Routeur', 'Serveur', 'Switch'];
  const statusOptions = [
    { value: 'EN_STOCK', label: 'En stock' },
    { value: 'AFFECTE', label: 'Affecté' },
    { value: 'EN_REPARATION', label: 'En réparation' },
    { value: 'SORTI', label: 'Sorti' }
  ];
  const conditionOptions = [
    { value: 'NEUF', label: 'Neuf' },
    { value: 'BON', label: 'Bon' },
    { value: 'MOYEN', label: 'Moyen' },
    { value: 'HS', label: 'Hors service' },
    { value: 'REFORME', label: 'Réformé' }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion du Parc Informatique</Typography>
        
        {/* Bouton Ajouter - seulement ADMIN */}
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assets/new')}
            sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
          >
            Nouveau matériel
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filtres - visibles pour tous */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher (série, code, type, marque...)"
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
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select name="type" value={filters.type} label="Type" onChange={handleFilterChange}>
                <MenuItem value="">Tous</MenuItem>
                {typeOptions.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select name="status" value={filters.status} label="Statut" onChange={handleFilterChange}>
                <MenuItem value="">Tous</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>État</InputLabel>
              <Select name="condition" value={filters.condition} label="État" onChange={handleFilterChange}>
                <MenuItem value="">Tous</MenuItem>
                {conditionOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Marque/Modèle</TableCell>
              <TableCell>N° Série</TableCell>
              <TableCell>Code inventaire</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Garantie</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun matériel trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.brand} {asset.model}</TableCell>
                  <TableCell>{asset.serialNumber}</TableCell>
                  <TableCell>{asset.inventoryCode}</TableCell>
                  <TableCell>{getStatusChip(asset.status)}</TableCell>
                  <TableCell>{getConditionChip(asset.condition)}</TableCell>
                  <TableCell>
                    {asset.warrantyEndDate ? (
                      <Chip
                        size="small"
                        label={new Date(asset.warrantyEndDate).toLocaleDateString()}
                        color={new Date(asset.warrantyEndDate) < new Date() ? 'error' : 'success'}
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {/* Voir - tout le monde peut voir */}
                    <IconButton size="small" onClick={() => navigate(`/assets/${asset.id}`)} title="Voir">
                      <ViewIcon />
                    </IconButton>
                    
                    {/* Modifier - seulement ADMIN */}
                    {isAdmin && (
                      <IconButton size="small" onClick={() => navigate(`/assets/edit/${asset.id}`)} title="Modifier">
                        <EditIcon />
                      </IconButton>
                    )}
                    
                    {/* Supprimer - seulement ADMIN */}
                    {isAdmin && (
                      <IconButton size="small" onClick={() => handleDeleteClick(asset)} title="Supprimer">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le matériel <strong>"{assetToDelete?.type} - {assetToDelete?.brand} {assetToDelete?.model}"</strong> ?
            <br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetList;