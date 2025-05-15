import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthForm, { UsernameField, PasswordField } from '../components/AuthForm';

export default function Register() {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [confirm,  setConfirm]      = useState('');
  const [error,    setError]        = useState('');
  const [success,  setSuccess]      = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    try {
      await api.post('register/', { username, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    }
  };

  return (
    <AuthForm
      title="Crie sua Conta"
      buttonText="Criar Conta"
      onSubmit={handleSubmit}
      error={error || (success && 'Conta criada! Redirecionando…')}
    >
      <UsernameField value={username} onChange={e => setUsername(e.target.value)} />
      <PasswordField value={password} onChange={e => setPassword(e.target.value)} />
      <PasswordField placeholder="Confirmar Senha" value={confirm} onChange={e => setConfirm(e.target.value)} />
    </AuthForm>
  );
}
