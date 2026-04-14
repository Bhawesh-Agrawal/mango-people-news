import BreakingBar       from '../components/home/BreakingBar'
import Hero              from '../components/home/Hero'
import TopStories        from '../components/home/TopStories'
import CategorySections  from '../components/home/CategorySections'
import SEO               from '../seo/Seo'

export default function HomePage() {
  return (
    <>
      <SEO
        path="/"
        // title omitted → "Mango People News — News for Every Indian"
        // description omitted → site default
        // ogImage omitted → /og-default.png
      />
      <BreakingBar />
      <Hero />
      <TopStories />
      <CategorySections />
    </>
  )
}