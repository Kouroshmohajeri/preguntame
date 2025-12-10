// app/page.tsx (or wherever your home page is)
"use client";
import Image from "next/image";
import { useState } from "react";

import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal/LoginModal";
import { useSession } from "next-auth/react";
import GameCodeModal from "@/components/JoinRoom/GameCodeModal";

export default function Home() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#fefaf6] dark:bg-gray-900 font-[Nunito]">
      {/* Centered Content */}
      <div className="flex flex-1 items-center justify-center">
        {/* Main Card */}
        <div className="flex flex-col bg-[#fffaf4] dark:bg-gray-800 border-4 border-black shadow-[6px_6px_0_#000] p-10 w-[22rem] sm:w-[26rem] rounded-2xl transition-all duration-300">
          {/* Logo */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Pregúntame Logo"
              width={180}
              height={180}
              className="contrast-125"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col w-full space-y-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="cursor-pointer w-full py-4 bg-[#fffaf4] text-black text-lg font-bold border-t-4 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] hover:bg-[#f5ebdf] transition-all duration-200"
            >
              Join Game
            </button>
            <button
              onClick={() => router.push("/create")}
              className="cursor-pointer w-full py-4 bg-[#fffaf4] text-black text-lg font-bold border-t-4 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] hover:bg-[#f5ebdf] transition-all duration-200"
            >
              Create Game
            </button>
            {session ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer w-full py-4 bg-[#fffaf4] text-black text-lg font-bold border-t-4 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] hover:bg-[#f5ebdf] transition-all duration-200"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="cursor-pointer w-full py-4 bg-[#fffaf4] text-black text-lg font-bold border-t-4 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] hover:bg-[#f5ebdf] transition-all duration-200"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-sm text-gray-700 dark:text-gray-300">
        <b>
          Designed by <span className="font-semibold">Web Gallery</span>
        </b>
      </footer>

      {/* Modals */}
      <GameCodeModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} type="join" />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
