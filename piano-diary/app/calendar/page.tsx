"use client";

import { useRouter } from "next/navigation";

export default function CalendarPage(){

  const router = useRouter();

  return(
    <main className="min-h-screen bg-[#F7F8FA] p-6 text-black">

      <div className="mx-auto max-w-md">


        {/* 뒤로가기 */}
        <button
          onClick={() => router.push("/")}
          className="
          mb-6
          rounded-2xl
          bg-white
          px-4
          py-2
          shadow
          hover:bg-gray-100
          "
        >
          ← 뒤로가기
        </button>



        <h1 className="text-3xl font-bold">
          📅 연습 기록
        </h1>



        <div className="mt-6 rounded-3xl bg-white p-6 shadow">


          <h2 className="text-xl font-bold">
            2026년 8월 3일 연습 기록
          </h2>



          <p className="mt-4">
            🎹 쇼팽 에튀드 Op.25 No.11
          </p>



          <p className="mt-2">
            템포 ♩=120
          </p>



          <p className="mt-4">
            왼손 힘 빼기 연습
          </p>


        </div>


      </div>

    </main>
  )

}