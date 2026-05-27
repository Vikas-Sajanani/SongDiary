import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen when signed out', () => {
  render(<App />);
  const linkElement = screen.getByText(/SongDiary/i);
  expect(linkElement).toBeInTheDocument();
});
