import { SoundMeter } from '@/components/sound-meter/sound-meter';

export default function Home() {
  return (
    <div
      className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center"
    >
      <h1 className="text-4xl font-bold mb-8 text-center">
        Sound Level Meter
      </h1>
      <SoundMeter />
    </div>
  );
}
