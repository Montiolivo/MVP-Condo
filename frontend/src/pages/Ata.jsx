import { useParams } from 'react-router-dom';

function Ata() {
  const { id } = useParams();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>🚧 Página de Ata</h1>
      <p>Em desenvolvimento - ID: {id}</p>
      <p>Esta página será convertida do HTML original</p>
    </div>
  );
}

export default Ata;
