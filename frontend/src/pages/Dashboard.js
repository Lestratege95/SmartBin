import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:8000/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBins: 0,
    fullBins: 0,
    emptyBins: 0,
    binsByType: {},
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/bins/`);
        const bins = response.data;

        const total = bins.length;
        const full = bins.filter(bin => bin.status === 'full' || bin.status === 'overflow').length;
        const empty = bins.filter(bin => bin.status === 'empty').length;

        const typeCounts = bins.reduce((acc, bin) => {
          acc[bin.type] = (acc[bin.type] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalBins: total,
          fullBins: full,
          emptyBins: empty,
          binsByType: typeCounts,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  const barChartData = {
    labels: ['Total', 'Pleines', 'Vides'],
    datasets: [
      {
        label: 'Statut des poubelles',
        data: [stats.totalBins, stats.fullBins, stats.emptyBins],
        backgroundColor: [
          'rgba(46, 125, 50, 0.5)',
          'rgba(244, 67, 54, 0.5)',
          'rgba(76, 175, 80, 0.5)',
        ],
        borderColor: [
          'rgba(46, 125, 50, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(stats.binsByType).map(type => {
      const types = {
        general: 'Général',
        recyclable: 'Recyclable',
        organic: 'Organique',
        hazardous: 'Dangereux',
      };
      return types[type] || type;
    }),
    datasets: [
      {
        data: Object.values(stats.binsByType),
        backgroundColor: [
          'rgba(46, 125, 50, 0.5)',
          'rgba(33, 150, 243, 0.5)',
          'rgba(255, 152, 0, 0.5)',
          'rgba(244, 67, 54, 0.5)',
        ],
        borderColor: [
          'rgba(46, 125, 50, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeleteIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total des poubelles</Typography>
              </Box>
              <Typography variant="h4">{stats.totalBins}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Poubelles pleines</Typography>
              </Box>
              <Typography variant="h4">{stats.fullBins}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Poubelles vides</Typography>
              </Box>
              <Typography variant="h4">{stats.emptyBins}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par statut
            </Typography>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par type
            </Typography>
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 