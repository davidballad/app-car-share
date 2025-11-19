import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Ecuador Rideshare</h3>
            <p>
              Conectamos conductores y pasajeros en todo Ecuador de forma segura y confiable.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="/search">Buscar Viajes</a></li>
              <li><a href="/register">Registrarse</a></li>
              <li><a href="/login">Iniciar Sesión</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Soporte</h3>
            <ul>
              <li><a href="/help">Centro de Ayuda</a></li>
              <li><a href="/contact">Contacto</a></li>
              <li><a href="/safety">Seguridad</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><a href="/terms">Términos de Uso</a></li>
              <li><a href="/privacy">Política de Privacidad</a></li>
              <li><a href="/cookies">Política de Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Ecuador Rideshare. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;