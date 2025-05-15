import './styles/AuthForm.css';
import { FaUser, FaLock } from 'react-icons/fa';

export default function AuthForm({
  title,
  buttonText,
  onSubmit,
  error,
  children,        
}) {
  return (
    <div className="login-container">
      <form onSubmit={onSubmit} className="login-form">
        <h2>{title}</h2>

        {children}

        {error && <p className="login-error">{error}</p>}

        <button type="submit">{buttonText}</button>
      </form>
    </div>
  );
}

export function UsernameField({ value, onChange }) {
  return (
    <div className="input-group">
      <FaUser className="icon" />
      <input
        type="text"
        placeholder="Usuário"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

export function PasswordField({ value, onChange, placeholder = 'Senha' }) {
  return (
    <div className="input-group">
      <FaLock className="icon" />
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}
