import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthForm, {
  UsernameField,
  PasswordField,
} from '../components/AuthForm';
import { MdEmail } from 'react-icons/md';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await api.post('register/', { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    }
  };

  return (
    <AuthForm
      title="Crie sua Conta"
      buttonText="Cadastrar"
      onSubmit={handleSubmit}
      error={error || (success && 'Conta criada com sucesso! Redirecionando…')}
    >
      <UsernameField
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className="input-group">
        <MdEmail className="icon" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <PasswordField
        placeholder="Confirmar Senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
    </AuthForm>
  );
}
