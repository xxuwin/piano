"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";


export default function SongsPage(){

  const router = useRouter();


  const [open,setOpen] = useState(false);


  const [songs,setSongs] = useState<any[]>([]);
const [user,setUser] = useState<any>(null);



  const [title,setTitle]=useState("");
  const [subtitle,setSubtitle]=useState("");

useEffect(()=>{

  supabase.auth.getUser()
  .then(({data})=>{

    if(!data.user){

      router.push("/login");
      return;

    }

    setUser(data.user);

  });

},[]);


useEffect(()=>{

  if(user){
    loadSongs();
  }

},[user]);


async function loadSongs(){

  const {data,error}=await supabase
  .from("project_save")
  .select("*")
  .eq("user_id",user.id)
  .order("id");


  if(error){
    console.log(error);
    return;
  }


  setSongs(
    data.map(song=>({
      id:song.id,
      title:song.song,
      subtitle:"",
      progress:song.progress ?? 0,
      count:0
    }))
  );

}

  async function addSong(){

  if(!title) return;

  if(!user) return;


  const {error}=await supabase
  .from("project_save")
  .insert({

    song:title,

    date:new Date()
    .toISOString()
    .split("T")[0],

    progress:0,

    tempo:80,

    memo:"",

    user_id:user.id

  });


  if(error){

    alert(error.message);
    return;

  }


  loadSongs();


  setTitle("");
  setSubtitle("");
  setOpen(false);

}





return(

<main className="
min-h-screen
bg-[#F7F8FC]
px-5
py-8
">


<div className="
mx-auto
max-w-md
">



<button

onClick={()=>router.push("/")}

className="
rounded-xl
bg-white
px-4
py-2
shadow-sm
"

>

←

</button>




<h1 className="
mt-6
text-3xl
font-bold
">

🎹 곡 관리

</h1>


<button

onClick={async()=>{

  await supabase.auth.signOut();

  router.push("/login");

}}

className="
mt-4
rounded-xl
bg-white
px-4
py-2
text-sm
text-gray-500
shadow-sm
"

>

로그아웃

</button>

<p className="
mt-2
text-gray-400
">

연습 중인 곡을 관리하세요

</p>






<div className="
mt-8
space-y-4
">


{

songs.map(song=>(


<button

key={song.id}

onClick={()=>
router.push(`/songs/${song.id}`)
}

className="
w-full
rounded-[30px]
bg-white
p-6
text-left
shadow-sm
"


>


<div className="
flex
justify-between
">


<div>

<h2 className="
text-lg
font-bold
">

🎼 {song.title}

</h2>


<p className="
mt-1
text-sm
text-gray-400
">

{song.subtitle}

</p>


</div>



<span className="
text-gray-400
">

→

</span>


</div>





<p className="
mt-5
text-sm
text-gray-400
">

연습 항목 {song.count}개

</p>



<div className="
mt-3
flex
items-center
gap-3
">


<div className="
h-3
flex-1
rounded-full
bg-gray-100
overflow-hidden
">


<div

style={{
width:`${song.progress}%`
}}

className="
h-full
rounded-full
bg-[#7ED6B2]
"

/>


</div>



<span className="
text-sm
font-bold
">

{song.progress}%

</span>


</div>


</button>


))


}



</div>







<button

onClick={()=>setOpen(true)}

className="
mt-6
w-full
rounded-3xl
bg-[#8CCBFF]
p-5
font-bold
text-white
"


>

＋ 곡 추가

</button>







{
open &&


<div className="
fixed
inset-0
bg-black/30
flex
items-end
">


<div className="
w-full
rounded-t-[35px]
bg-white
p-7
">


<h2 className="
text-xl
font-bold
">

곡 추가

</h2>




<input

value={title}

onChange={(e)=>
setTitle(e.target.value)
}

placeholder="곡 이름"

className="
mt-5
w-full
rounded-xl
border
p-3
"

/>



<input

value={subtitle}

onChange={(e)=>
setSubtitle(e.target.value)
}

placeholder="작곡가 / 작품번호"

className="
mt-3
w-full
rounded-xl
border
p-3
"

/>




<button

onClick={addSong}

className="
mt-5
w-full
rounded-xl
bg-[#8CCBFF]
p-4
text-white
font-bold
"

>

추가

</button>


</div>


</div>


}



</div>


</main>


);


}