import CustomSignIn from '@/components/custom-signin';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <CustomSignIn
          providers={['google', 'github', 'credentials']}
          brandName="My Awesome App"
          // brandLogo="/path/to/your/logo.png"
          primaryColor="bg-purple-600 hover:bg-purple-700"
        />
      </div>
    </div>
  );
}
