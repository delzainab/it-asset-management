import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReturnIcon from '@mui/icons-material/KeyboardReturn';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import assetService from '../../services/asset.service';
import api from '../../services/api';
import AssignmentModal from '../assignments/AssignmentModal';
import ReturnModal from '../assignments/ReturnModal';
import MaintenanceModal from '../maintenances/MaintenanceModal';
import useRole from '../../hooks/useRole';

const AssetDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isTechnician, isConsultation } = useRole();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openReturnModal, setOpenReturnModal] = useState(false);
  const [openMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  useEffect(() => {
    loadAsset();
    loadCurrentAssignment();
    loadAssignmentHistory();
  }, [id]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAssetById(id);
      setAsset(data);
    } catch (err) {
      setError('Erreur lors du chargement du matériel');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentAssignment = async () => {
    try {
      const response = await api.get(`/assignments/asset/${id}`);
      const assignments = response.data;
      const current = assignments.find(a => a.type === 'AFFECTATION' && !a.endDate);
      setCurrentAssignment(current || null);
    } catch (err) {
      console.error('Erreur chargement affectation:', err);
    }
  };

  const loadAssignmentHistory = async () => {
    try {
      const response = await api.get(`/assignments/asset/${id}`);
      setAssignmentHistory(response.data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
      try {
        await assetService.deleteAsset(id);
        navigate('/assets');
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'EN_STOCK': { color: 'success', label: 'En stock', icon: '📦' },
      'AFFECTE': { color: 'primary', label: 'Affecté', icon: '👤' },
      'EN_REPARATION': { color: 'warning', label: 'En réparation', icon: '🔧' },
      'SORTI': { color: 'default', label: 'Sorti', icon: '📤' }
    };
    const config = statusConfig[status] || { color: 'default', label: status, icon: '❓' };
    return (
      <Chip 
        color={config.color} 
        label={`${config.icon} ${config.label}`} 
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const getConditionChip = (condition) => {
    const conditionConfig = {
      'NEUF': { color: 'success', label: 'Neuf', icon: '✨' },
      'BON': { color: 'info', label: 'Bon', icon: '👍' },
      'MOYEN': { color: 'warning', label: 'Moyen', icon: '⚡' },
      'HS': { color: 'error', label: 'Hors service', icon: '💀' },
      'REFORME': { color: 'default', label: 'Réformé', icon: '📄' }
    };
    const config = conditionConfig[condition] || { color: 'default', label: condition, icon: '❓' };
    return (
      <Chip 
        color={config.color} 
        label={`${config.icon} ${config.label}`} 
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!asset) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">Matériel non trouvé</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')}>
          Retour à la liste
        </Button>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Affecter - seulement ADMIN */}
          {isAdmin && asset.status === 'EN_STOCK' && (
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={() => setOpenAssignModal(true)}
              sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#229954' } }}
            >
              Affecter
            </Button>
          )}
          
          {/* Retour en stock - seulement ADMIN */}
          {isAdmin && asset.status === 'AFFECTE' && (
            <Button
              variant="contained"
              startIcon={<ReturnIcon />}
              onClick={() => setOpenReturnModal(true)}
              sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
            >
              Retour en stock
            </Button>
          )}
          
          {/* Maintenance - ADMIN et TECHNICIEN */}
          {(isAdmin || isTechnician) && (
            <Button
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={() => setOpenMaintenanceModal(true)}
              sx={{ bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' } }}
            >
              Maintenance
            </Button>
          )}
          
          {/* Modifier - seulement ADMIN */}
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/assets/edit/${id}`)}
            >
              Modifier
            </Button>
          )}
          
          {/* Supprimer - seulement ADMIN */}
          {isAdmin && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {asset.type} - {asset.brand} {asset.model}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {getStatusChip(asset.status)}
          {getConditionChip(asset.condition)}
          {asset.warrantyEndDate && new Date(asset.warrantyEndDate) < new Date() && (
            <Chip color="error" label="⚠️ Garantie expirée" />
          )}
        </Box>

        {/* Carte d'affectation en cours */}
        {currentAssignment && (
          <Card sx={{ mb: 3, bgcolor: '#e8f0fe', border: '1px solid #4361ee' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4361ee' }}>
                  {currentAssignment.user ? <PersonIcon /> : <BusinessIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Actuellement affecté à :
                  </Typography>
                  <Typography variant="h6">
                    {currentAssignment.user ? currentAssignment.user.fullName : currentAssignment.department?.name}
                  </Typography>
                  {currentAssignment.user && (
                    <Typography variant="body2" color="text.secondary">
                      {currentAssignment.user.email}
                    </Typography>
                  )}
                  {currentAssignment.comment && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Commentaire: {currentAssignment.comment}
                    </Typography>
                  )}
                </Box>
                <Chip 
                  label={`Depuis le ${new Date(currentAssignment.startDate).toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" gutterBottom>
                  <strong>Type :</strong> {asset.type}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Marque :</strong> {asset.brand}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Modèle :</strong> {asset.model}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>N° de série :</strong> <code>{asset.serialNumber}</code>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Code inventaire :</strong> <code>{asset.inventoryCode}</code>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dates et garantie
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" gutterBottom>
                  <strong>Date d'achat :</strong> {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'Non renseignée'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fin de garantie :</strong> {asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString() : 'Non renseignée'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Statut garantie :</strong> {
                    asset.warrantyEndDate ? (
                      new Date(asset.warrantyEndDate) > new Date() ? 
                      <Chip size="small" color="success" label="Valide" /> : 
                      <Chip size="small" color="error" label="Expirée" />
                    ) : 'Non renseignée'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Localisation
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Bureau :</strong> {asset.office ? 
                        `${asset.office.name} (${asset.office.building || ''}${asset.office.building && asset.office.floor ? ', ' : ''}${asset.office.floor || ''})` 
                        : 'Non affecté'}
                    </Typography>
                    {asset.office?.site && (
                      <Typography variant="body2" color="text.secondary">
                        Site: {asset.office.site}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Service :</strong> {asset.service ? asset.service.name : 'Non affecté'}
                    </Typography>
                    {asset.service?.description && (
                      <Typography variant="body2" color="text.secondary">
                        {asset.service.description}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Modals */}
      <AssignmentModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        assetId={id}
        onSuccess={() => {
          loadAsset();
          loadCurrentAssignment();
          loadAssignmentHistory();
        }}
      />

      <ReturnModal
        open={openReturnModal}
        onClose={() => setOpenReturnModal(false)}
        assetId={id}
        assetName={`${asset.type} - ${asset.brand} ${asset.model}`}
        onSuccess={() => {
          loadAsset();
          loadCurrentAssignment();
          loadAssignmentHistory();
        }}
      />

      <MaintenanceModal
        open={openMaintenanceModal}
        onClose={() => setOpenMaintenanceModal(false)}
        assetId={id}
        onSuccess={loadAsset}
      />
    </Box>
  );
};

export default AssetDetails;