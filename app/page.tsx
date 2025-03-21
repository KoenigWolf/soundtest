import { PageContainer } from '@/components/layouts/page-container'
import { SoundMeter } from '@/components/sound-meter/sound-meter'

export default function Home() {
  return (
    <PageContainer title="Sound Level Meter">
      <SoundMeter />
    </PageContainer>
  )
}
