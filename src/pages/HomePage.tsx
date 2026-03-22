import BreakingBar       from '../components/home/BreakingBar'
import Hero              from '../components/home/Hero'
import TopStories        from '../components/home/TopStories'
import CategorySections  from '../components/home/CategorySections'

export default function HomePage() {
  return (
    <>
      <BreakingBar />
      <Hero />
      <TopStories />
      <CategorySections />
    </>
  )
}