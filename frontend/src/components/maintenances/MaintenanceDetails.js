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
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import useRole from '../../hooks/useRole';

const MaintenanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTechnician } = useRole();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMaintenance();
  }, [id]);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenances/${id}`);
      setMaintenance(response.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette maintenance ?')) {
      try {
        await api.delete(`/maintenances/${id}`);
        navigate('/maintenances');
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const getTypeLabel = (type) => {
    return type === 'PREVENTIVE' ? 'Préventive' : 'Corrective';
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'PLANIFIE': return 'Planifiée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminée';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PLANIFIE': return 'default';
      case 'EN_COURS': return 'warning';
      case 'TERMINE': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !maintenance) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Maintenance non trouvée'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/maintenances')}>
          Retour à la liste
        </Button>
        {(isAdmin || isTechnician) && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/maintenances/edit/${id}`)}
              sx={{ mr: 1 }}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Maintenance #{maintenance.id}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Chip label={getTypeLabel(maintenance.type)} color="primary" />
          <Chip label={getStatusLabel(maintenance.status)} color={getStatusColor(maintenance.status)} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Informations générales</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Matériel :</strong> {maintenance.asset?.type} - {maintenance.asset?.brand} {maintenance.asset?.model}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>N° série :</strong> {maintenance.asset?.serialNumber}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Code inventaire :</strong> {maintenance.asset?.inventoryCode}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Technicien :</strong> {maintenance.technician?.fullName || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Dates et durée</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Date d'intervention :</strong> {maintenance.interventionDate ? new Date(maintenance.interventionDate).toLocaleDateString() : '-'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Durée :</strong> {maintenance.duration ? `${maintenance.duration} heures` : '-'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Coût :</strong> {maintenance.cost ? `${maintenance.cost} DH` : '-'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Prestataire :</strong> {maintenance.provider || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Description</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Problème :</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {maintenance.problemDescription || '-'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Actions réalisées :</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {maintenance.actionsPerformed || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MaintenanceDetails;