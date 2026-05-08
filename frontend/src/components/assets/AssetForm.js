import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import assetService from '../../services/asset.service';
import officeService from '../../services/office.service';
import departmentService from '../../services/department.service';
import useRole from '../../hooks/useRole';

const AssetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useRole();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    inventoryCode: '',
    purchaseDate: '',
    warrantyEndDate: '',
    condition: 'BON',
    status: 'EN_STOCK',
    officeId: '',
    serviceId: ''
  });

  const [offices, setOffices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOffices();
    loadDepartments();
    if (isEditMode) {
      loadAsset();
    }
  }, [isEditMode]);

  const loadOffices = async () => {
    try {
      const data = await officeService.getAllOffices();
      setOffices(data);
    } catch (err) {
      console.error('Erreur chargement bureaux:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    }
  };

  const loadAsset = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAssetById(id);
      setFormData({
        type: data.type || '',
        brand: data.brand || '',
        model: data.model || '',
        serialNumber: data.serialNumber || '',
        inventoryCode: data.inventoryCode || '',
        purchaseDate: data.purchaseDate || '',
        warrantyEndDate: data.warrantyEndDate || '',
        condition: data.condition || 'BON',
        status: data.status || 'EN_STOCK',
        officeId: data.office?.id || '',
        serviceId: data.service?.id || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement du matériel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const assetData = {
      ...formData,
      office: formData.officeId ? { id: formData.officeId } : null,
      service: formData.serviceId ? { id: formData.serviceId } : null
    };

    try {
      if (isEditMode) {
        await assetService.updateAsset(id, assetData);
        setSuccess('Matériel modifié avec succès !');
      } else {
        await assetService.createAsset(assetData);
        setSuccess('Matériel ajouté avec succès !');
        if (!isEditMode) {
          setFormData({
            type: '',
            brand: '',
            model: '',
            serialNumber: '',
            inventoryCode: '',
            purchaseDate: '',
            warrantyEndDate: '',
            condition: 'BON',
            status: 'EN_STOCK',
            officeId: '',
            serviceId: ''
          });
        }
      }
      setTimeout(() => {
        navigate('/assets');
      }, 1500);
    } catch (err) {
      setError(err.response?.data || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
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

  if (!isAdmin) {
    return <Navigate to="/assets" />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/assets')}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'Modifier le matériel' : 'Ajouter un nouveau matériel'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleChange}
                >
                  {typeOptions.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Marque */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marque"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Modèle */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modèle"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Numéro de série */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numéro de série"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                disabled={isEditMode}
                required
                helperText={isEditMode ? "Le numéro de série ne peut pas être modifié" : ""}
              />
            </Grid>

            {/* Code inventaire */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code inventaire"
                name="inventoryCode"
                value={formData.inventoryCode}
                onChange={handleChange}
                disabled={isEditMode}
                required
                helperText={isEditMode ? "Le code inventaire ne peut pas être modifié" : ""}
              />
            </Grid>

            {/* Bureau */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Bureau</InputLabel>
                <Select
                  name="officeId"
                  value={formData.officeId}
                  label="Bureau"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Non affecté --</MenuItem>
                  {offices.map(office => (
                    <MenuItem key={office.id} value={office.id}>
                      {office.name} - {office.building} ({office.site})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Service */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  name="serviceId"
                  value={formData.serviceId}
                  label="Service"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Non affecté --</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date d'achat */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date d'achat"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Fin de garantie */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fin de garantie"
                name="warrantyEndDate"
                type="date"
                value={formData.warrantyEndDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* État */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>État</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  label="État"
                  onChange={handleChange}
                >
                  {conditionOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Statut */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Statut"
                  onChange={handleChange}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Boutons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/assets')}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
                >
                  {saving ? <CircularProgress size={24} /> : (isEditMode ? 'Modifier' : 'Ajouter')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AssetForm;