frontend/src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

export const COLORS = {
    PRIMARY_BLUE: '#007bff',
    DARK_NAVY: '#0b1437',
    LIGHT_GRAY_BG: '#f4f7fe',
    WHITE: '#ffffff',
    TEXT_LIGHT: '#a3aed0',
    TEXT_DARK: '#2d3748',
    NEON_BLUE_START: 'rgba(0, 123, 255, 0.4)',
    NEON_BLUE_END: 'rgba(0, 123, 255, 0.1)',
};

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins', sans-serif; }
  body { background-color:${COLORS.LIGHT_GRAY_BG}; color:${COLORS.TEXT_DARK}; min-height:100vh; overflow-x:hidden; }
  #root { min-height:100vh; }

  html, body, #root {
    margin: 0;
    padding: 0;
    /* Ensure height covers the viewport */
    height: 100%;
    width: 100%;
    /* Set default font for the whole app */
    font-family: 'Inter', sans-serif;
}
`;


