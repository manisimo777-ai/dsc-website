import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className="text-center text-white max-w-[900px] bg-white/10 backdrop-blur-md rounded-[20px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <Image
          src="/ishbs_3360x448.5010537456_hrzsc2m2.jpg.webp"
          alt="Dappled Specter Co Logo"
          width={800}
          height={107}
          className="w-full max-w-[800px] h-auto mb-8 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
          priority
        />
        <h1 className="text-5xl mb-4 font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
          Coming Soon
        </h1>
        <p className="text-xl mb-8 opacity-95">
          We&apos;re working on something amazing. Stay tuned!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <Link
            href="/products"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full no-underline font-semibold text-lg transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]"
          >
            Shop Now
          </Link>
          <Link
            href="https://www.etsy.com/shop/dappledspecterco"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#667eea] px-10 py-4 rounded-full no-underline font-semibold text-lg transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]"
          >
            View on Etsy
          </Link>
        </div>
      </div>
    </div>
  );
}
