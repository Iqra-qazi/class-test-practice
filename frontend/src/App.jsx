import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            border: '1px solid #E4E8E4',
            borderRadius: '12px',
            color: '#25363A',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
    </>
  )
}

export default App
