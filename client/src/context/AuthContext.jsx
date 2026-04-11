import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem('adminToken') || null
  );
  const [adminInfo, setAdminInfo] = useState(
    JSON.parse(localStorage.getItem('adminInfo') || 'null')
  );

  const login = (token, user) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(user));
    setAdminToken(token);
    setAdminInfo(user);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setAdminToken(null);
    setAdminInfo(null);
  };

  return (
    <AuthContext.Provider value={{ adminToken, adminInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);