import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Send as SendIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
} from '@mui/icons-material';
import userService from '../services/userService';
import CreateUserDialog from '../components/CreateUserDialog';
import EditUserDialog from '../components/EditUserDialog';

export default function UserManagementPage() {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Menu states
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  
  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [sendCredentials, setSendCredentials] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Load users
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      
      const data = await userService.getUsers(params);
      setUsers(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore nel caricamento degli utenti');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((u) => u.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((selectedId) => selectedId !== id);
    }

    setSelected(newSelected);
  };

  // Bulk actions
  const handleBulkMenuOpen = (event) => {
    setBulkMenuAnchor(event.currentTarget);
  };

  const handleBulkMenuClose = () => {
    setBulkMenuAnchor(null);
  };

  const executeBulkAction = async (action, extraData = {}) => {
    if (selected.length === 0) {
      alert('Seleziona almeno un utente');
      return;
    }

    const confirmMessage = {
      activate: 'Attivare i volontari selezionati?',
      deactivate: 'Disattivare i volontari selezionati?',
      delete: 'Eliminare gli utenti selezionati? (soft delete)',
      send_credentials: 'Inviare le credenziali agli utenti selezionati? (Verrà generata una nuova password)',
    }[action];

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const result = await userService.bulkActions(action, selected, extraData);
      
      alert(result.message);
      setSelected([]);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Errore nell\'esecuzione dell\'azione');
      console.error('Bulk action error:', err);
    } finally {
      setLoading(false);
      handleBulkMenuClose();
    }
  };

  // Export
  const handleExport = async () => {
    try {
      setLoading(true);
      
      const filters = {
        format: 'csv',
      };
      if (searchTerm) filters.search = searchTerm;
      if (roleFilter) filters.role = roleFilter;
      
      const blob = await userService.exportUsers(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `utenti_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Export completato con successo!');
    } catch (err) {
      alert(err.response?.data?.error || 'Errore durante l\'export');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Import - File selection
  const handleImportFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportErrors([]);
    setImportPreview(null);

    try {
      setImportLoading(true);
      const preview = await userService.previewCSVImport(file, sendCredentials);
      
      setImportPreview(preview.preview);
      setImportErrors(preview.errors || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Errore nella lettura del file CSV');
      console.error('CSV preview error:', err);
    } finally {
      setImportLoading(false);
    }
  };

  // Import - Confirm
  const handleImportConfirm = async () => {
    if (!importFile) return;

    if (importErrors.length > 0) {
      alert('Correggi gli errori nel file CSV prima di procedere');
      return;
    }

    try {
      setImportLoading(true);
      const result = await userService.confirmCSVImport(importFile, sendCredentials);
      
      alert(result.message);
      setImportDialogOpen(false);
      setImportFile(null);
      setImportPreview(null);
      setImportErrors([]);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Errore durante l\'import');
      console.error('CSV import error:', err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gestione Utenti</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Importa CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Esporta
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nuovo Utente
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Cerca per nome, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ruolo</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Ruolo"
            >
              <MenuItem value="">Tutti</MenuItem>
              <MenuItem value="superadmin">Super Admin</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="base">Volontario Base</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          bgcolor: 'primary.light',
          border: '2px solid #ff5983',
          borderRadius: '8px',
          background: '#ffffff'
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              {selected.length} utenti selezionati
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ActivateIcon />}
              onClick={() => executeBulkAction('activate')}
            >
              Attiva
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeactivateIcon />}
              onClick={() => executeBulkAction('deactivate')}
            >
              Disattiva
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SendIcon />}
              onClick={() => executeBulkAction('send_credentials')}
            >
              Invia Credenziali
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => executeBulkAction('delete')}
            >
              Elimina
            </Button>
            <IconButton onClick={handleBulkMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={handleBulkMenuClose}
      >
        <MenuItem onClick={() => {
          const role = prompt('Inserisci il ruolo (superadmin, admin, base):');
          if (role) executeBulkAction('assign_role', { role });
        }}>
          Assegna Ruolo
        </MenuItem>
      </Menu>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < users.length}
                    checked={users.length > 0 && selected.length === users.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Nome Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ruolo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Aree di Lavoro</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nessun utente trovato
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    selected={selected.indexOf(user.id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.indexOf(user.id) !== -1}
                        onChange={() => handleSelectOne(user.id)}
                      />
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={
                          user.role === 'superadmin' ? 'error' :
                          user.role === 'admin' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active_volunteer ? 'Attivo' : 'Non attivo'}
                        size="small"
                        color={user.is_active_volunteer ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.work_areas?.map((wa) => (
                        <Chip
                          key={wa.id}
                          label={wa.name}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifica">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Elimina">
                        <IconButton
                          size="small"
                          onClick={() => alert('TODO: Implementare eliminazione')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Righe per pagina:"
        />
      </Paper>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importLoading && setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Importa Utenti da CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* File upload */}
            <Box>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportFileChange}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImportIcon />}
                  disabled={importLoading}
                >
                  Seleziona File CSV
                </Button>
              </label>
              {importFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  File selezionato: {importFile.name}
                </Typography>
              )}
            </Box>

            {/* Send credentials checkbox */}
            <FormControl>
              <Stack direction="row" spacing={2} alignItems="center">
                <Checkbox
                  checked={sendCredentials}
                  onChange={(e) => setSendCredentials(e.target.checked)}
                />
                <Typography variant="body2">
                  Invia credenziali via email dopo l'import
                </Typography>
              </Stack>
            </FormControl>

            {/* CSV Format Info */}
            <Alert severity="info">
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Formato CSV richiesto:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                username,email,first_name,last_name,role,phone,work_area_codes{'\n'}
                mario.rossi,mario@example.com,Mario,Rossi,base,3331234567,LOG{'\n'}
                giulia.bianchi,giulia@example.com,Giulia,Bianchi,admin,3337654321,"LOG,SAN"
              </Typography>
            </Alert>

            {/* Loading */}
            {importLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Errors */}
            {importErrors.length > 0 && (
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Errori trovati nel file:
                </Typography>
                {importErrors.slice(0, 5).map((err, idx) => (
                  <Typography key={idx} variant="body2" sx={{ fontSize: '0.75rem' }}>
                    Riga {err.row}: {err.errors.join(', ')}
                  </Typography>
                ))}
                {importErrors.length > 5 && (
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 1 }}>
                    ... e altri {importErrors.length - 5} errori
                  </Typography>
                )}
              </Alert>
            )}

            {/* Preview */}
            {importPreview && importPreview.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Anteprima ({importPreview.length} utenti da importare):
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Cognome</TableCell>
                        <TableCell>Ruolo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importPreview.slice(0, 5).map((user, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.first_name}</TableCell>
                          <TableCell>{user.last_name}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {importPreview.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    ... e altri {importPreview.length - 5} utenti
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importLoading}>
            Annulla
          </Button>
          <Button
            variant="contained"
            onClick={handleImportConfirm}
            disabled={!importFile || importErrors.length > 0 || importLoading}
          >
            Conferma Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          loadUsers(); // Reload users list
        }}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          loadUsers(); // Reload users list
        }}
        user={editingUser}
      />
    </Box>
  );
}