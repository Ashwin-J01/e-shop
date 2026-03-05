import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // Redirect direct navigation to home (modal can be opened via Navbar)
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
};

export default Login;
