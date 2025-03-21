import { SoundMeter } from '@/components/sound-meter/sound-meter'

// Homeコンポーネント　メインのUIを提供する
export default function Home() {
  return (
    // レスポンシブなコンテナ　中央に配置
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Sound Level Meter
      </h1>
      <SoundMeter />
    </div>
  )
}
