import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '../services/api';
import './Listagem.css';

const usuarioId = '4f51bb24-a766-45f0-b78f-8e2f09087422';

function Listagem() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar tema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = savedTheme === 'light' ? 'light-mode' : '';
    
    loadTranscriptions();
    const interval = setInterval(loadTranscriptions, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadTranscriptions = async () => {
    try {
      const response = await audioService.getAll(statusFilter);
      if (response.data.success) {
        setTranscriptions(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar transcrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme === 'light' ? 'light-mode' : '';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['mp3', 'wav', 'm4a'];
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        setMessage({ type: 'error', text: 'Formato não suportado. Use: MP3, WAV ou M4A' });
        return;
      }
      
      if (file.size > 400 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Arquivo muito grande. Tamanho máximo: 400MB' });
        return;
      }
      
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecione um arquivo' });
      return;
    }

    const reuniao = e.target.reuniao.value;
    if (!reuniao) {
      setMessage({ type: 'error', text: 'Selecione uma reunião' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('usuarioId', usuarioId);
    formData.append('idReuniaoOuTeste', reuniao);

    try {
      const response = await audioService.upload(formData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Arquivo enviado com sucesso!' });
        setShowModal(false);
        setSelectedFile(null);
        setTimeout(loadTranscriptions, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao enviar arquivo' });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDENTE': 'Pendente',
      'PROCESSANDO': 'Processando',
      'CONCLUIDO': 'Concluído',
      'ERRO': 'Erro'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <h1>🎙️ SGC-MVP</h1>
          <p className="subtitle">Sistema de Transcrição de Áudio</p>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nova Transcrição
          </button>
        </div>
      </div>

      <div className="filters">
        <label>Filtrar por status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PROCESSANDO">Processando</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="ERRO">Erro</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : transcriptions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nome do Arquivo</th>
                <th>Reunião</th>
                <th>Data de Upload</th>
                <th>Status</th>
                <th>Ata</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transcriptions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.nomeOriginal}</strong><br />
                    <small>{formatFileSize(item.tamanhoBytes)}</small>
                  </td>
                  <td>{item.idReuniaoOuTeste || '-'}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <span className={`status-badge status-${item.statusProcessamento.toLowerCase()}`}>
                      {getStatusText(item.statusProcessamento)}
                    </span>
                  </td>
                  <td>
                    {item.ataGerada && item.statusAta === 'CONCLUIDA' ? (
                      <button 
                        className="btn-action btn-ata"
                        onClick={() => navigate(`/ata/${item.id}`)}
                      >
                        📄 Ver Ata
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-action btn-details"
                      onClick={() => navigate(`/detalhes/${item.id}`)}
                    >
                      👁️ Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Nenhuma transcrição encontrada</h3>
            <p>Clique em "Nova Transcrição" para começar</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            <h2>📤 Upload de Áudio</h2>
            <p className="subtitle">Envie um arquivo para transcrição</p>

            <form onSubmit={handleUpload}>
              <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                    <p><strong>{selectedFile.name}</strong></p>
                    <p>{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                    <p>Clique ou arraste um arquivo de áudio</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      MP3, WAV ou M4A (máx. 400MB)
                    </p>
                  </div>
                )}
              </div>
              
              <input
                id="fileInput"
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <select name="reuniao" required>
                <option value="">Selecione a reunião</option>
                <option value="REUNIAO_001">Reunião 001</option>
                <option value="REUNIAO_002">Reunião 002</option>
                <option value="TESTE">Teste</option>
              </select>

              {message && (
                <div className={`alert alert-${message.type}`}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={uploading || !selectedFile}
              >
                {uploading ? '⏳ Enviando...' : '📤 Enviar Áudio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Listagem;
