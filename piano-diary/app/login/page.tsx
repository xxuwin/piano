"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [name,setName]=useState("");
  const [loading,setLoading]=useState(false);


  async function login(){

    if(!name){
      alert("아이디를 입력하세요");
      return;
    }


    setLoading(true);


    const {data,error}=await supabase
      .from("users")
      .select("*")
      .eq("name",name)
      .single();


    setLoading(false);


    if(error || !data){

      alert("존재하지 않는 아이디입니다");
      return;

    }


    localStorage.setItem(
      "user_id",
      data.id
    );


    router.replace("/");

  }



  return (

<main className="
min-h-screen
bg-[#F7F8FC]
flex
items-center
justify-center
p-6
">


<div className="
w-full
max-w-md
rounded-[32px]
bg-white
p-8
shadow-sm
">


<h1 className="
text-4xl
text-center
">
🎹
</h1>


<h2 className="
mt-4
text-center
text-2xl
font-bold
">
Piano Diary
</h2>


<p className="
mt-2
text-center
text-gray-400
">
아이디로 접속하세요
</p>



<input

value={name}

onChange={(e)=>
setName(e.target.value)
}

placeholder="아이디"

className="
mt-8
w-full
rounded-xl
border
p-4
"

/>



<button

onClick={login}

disabled={loading}

className="
mt-6
w-full
rounded-2xl
bg-[#8CCBFF]
p-4
font-bold
text-white
"

>

{
loading
?
"확인 중..."
:
"접속하기"
}

</button>




<button

onClick={()=>
router.push("/signup")
}

className="
mt-4
w-full
rounded-2xl
border
p-4
font-bold
"

>

회원가입

</button>



</div>


</main>


  );

}