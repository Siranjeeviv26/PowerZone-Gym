import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import StatsCounter from '../components/home/StatsCounter'
import Programs from '../components/home/Programs'
import TrainerPreview from '../components/home/TrainerPreview'
import Testimonials from '../components/home/Testimonials'
import CallToAction from '../components/home/CallToAction'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <StatsCounter />
      <Programs />
      <TrainerPreview />
      <Testimonials />
      <CallToAction />
    </>
  )
}
