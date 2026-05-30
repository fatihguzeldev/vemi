import { Footer, Header } from '../components/Header'
import { StepSlider } from '../components/StepSlider'
import { LocaleProvider } from '../context/LocaleContext'
import { ThemeProvider } from '../context/ThemeContext'

export function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <Header />
        <main class="main">
          <StepSlider />
        </main>
        <Footer />
      </LocaleProvider>
    </ThemeProvider>
  )
}
