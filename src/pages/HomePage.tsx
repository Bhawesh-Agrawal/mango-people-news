import BreakingBar       from '../components/home/BreakingBar'
import Hero              from '../components/home/Hero'
import CategorySections  from '../components/home/CategorySections'
import SEO               from '../seo/Seo'
import { useHomeData }   from '../hooks/useHomeData'

function HomePageSkeleton() {
  return (
    <>
      <SEO path="/" />
      <div className="page-container py-16 space-y-8">
        <div className="skeleton h-10 w-48 rounded" />
        <div className="skeleton h-72 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    </>
  )
}

export default function HomePage() {
  const { data, loading, error } = useHomeData()

  if (loading && !data) return <HomePageSkeleton />

  if (!data && error) {
    return (
      <div className="page-container py-16 text-center">
        <p className="text-lg font-semibold">Unable to load homepage content.</p>
        <p className="text-sm text-muted">Please refresh the page or try again later.</p>
      </div>
    )
  }

  return (
    <>
      <SEO
        path="/"
        // title omitted → "Mango People News — News for Every Indian"
        // description omitted → site default
        // ogImage omitted → /og-default.png
      />
      <BreakingBar articles={data?.breaking ?? []} />
      <Hero articles={data?.hero ?? []} />
      <CategorySections
        categories={data?.categories ?? []}
        categoryArticles={data?.categoryArticles ?? {}}
        marketQuotes={data?.marketQuotes ?? []}
      />
    </>
  )
}