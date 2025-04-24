import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from 'date-fns/locale';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [bins, setBins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    bin: '',
    date: new Date(),
    notes: '',
  });

  const columns = [
    {
      field: 'bin_name',
      headerName: 'Poubelle',
      width: 200,
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 200,
      valueGetter: (params) => new Date(params.row.date).toLocaleDateString('fr-FR'),
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 300,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchCollections();
    fetchBins();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${API_URL}/collections/`);
      setCollections(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes:', error);
    }
  };

  const fetchBins = async () => {
    try {
      const response = await axios.get(`${API_URL}/bins/`);
      setBins(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des poubelles:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({
      bin: '',
      date: new Date(),
      notes: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette collecte ?')) {
      try {
        await axios.delete(`${API_URL}/collections/${id}/`);
        fetchCollections();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/collections/`, {
        ...formData,
        date: formData.date.toISOString(),
      });
      handleCloseDialog();
      fetchCollections();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Historique des collectes</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchCollections}
            sx={{ mr: 2 }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Nouvelle collecte
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={collections}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle collecte</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Poubelle"
                  name="bin"
                  value={formData.bin}
                  onChange={handleChange}
                  required
                >
                  {bins.map((bin) => (
                    <MenuItem key={bin.id} value={bin.id}>
                      {bin.name} - {bin.location}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label="Date de collecte"
                    value={formData.date}
                    onChange={(newValue) => {
                      setFormData({ ...formData, date: newValue });
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Collections; 