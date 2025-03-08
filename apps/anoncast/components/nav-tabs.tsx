import { useCreatePost } from './create-post/context'
import AnimatedTabs from './post-feed/animated-tabs'

export function NavTabs() {
  const { variant, setVariant } = useCreatePost()

  return (
    <AnimatedTabs
      tabs={['anoncast', 'news']}
      activeTab={variant}
      onTabChange={(tab) => setVariant(tab as 'anoncast' | 'news')}
      layoutId="main-tabs"
    />
  )
}
