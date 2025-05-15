import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

import AuthForm, {
  UsernameField,
  PasswordField,
} from '../components/AuthForm';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await api.post('token/', { username, password });
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      navigate('/discover');
    } catch {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <AuthForm
      title="Login"
      buttonText="Entrar"
      onSubmit={handleSubmit}
      error={error}
    >
      <UsernameField value={username} onChange={(e) => setUsername(e.target.value)} />
      <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />

      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        Ainda não tem conta?{' '}
        <Link to="../register" style={{ color: '#6c63ff' }}>
          Crie uma aqui
        </Link>
      </p>
    </AuthForm>
  )
}
